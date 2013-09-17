/*
TODO - resolve requirements by using ext-dev.js
Ext.require([
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.util.*'
]);
*/

Ext.require([
    'Transactions.store.InstrumentStore',
    'Transactions.module.TransactionComms'
]);

var TradeGridExt = (function () {
    var me = {};

    me.controller = null;
    me.grid = null;
    me.store = null;
    me.rowEditing = null;
    me.ignoreRow = false;
    me.groupByMonthToggle = false;
    me.groupByMonthText = ['By Month', 'Ungroup'];
    me.instrumentStore = null;

    me.init = function (grid, controller, disableSummary) {
        me.grid = grid;
        me.controller = controller;
        me.store = grid.getStore();
        me.rowEditing = grid.getPlugin('DeleteEmptyTradeRowOnCancelEditing');
        me.instrumentStore = Ext.data.StoreManager.lookup('Transactions.store.InstrumentStore');

        grid.getSelectionModel().on('selectionchange', function (selModel, selections) {
            grid.down('#delete').setDisabled(selections.length === 0);
        });

        if (!disableSummary) {
            grid.getView().getFeature('groupsummary').disable();
        }
    }

    me.groupByMonth = function (columnHeader) {
        var btn = me.grid.down('#byMonthUngroup');
        if (columnHeader == 'Date') {
            // Called because either (1) user clicked groupByMonthText button or (2) user click 'Group by this field' on the "Date" column dropdown menu
            // Toggle button push
            var view = me.grid.getView(),
                groupsummary = view.getFeature('groupsummary');

            if (!me.groupByMonthToggle) {
                btn.setText(me.groupByMonthText[1]);
                groupsummary.groupBy('Date');
            } else {
                btn.setText(me.groupByMonthText[0]);
                groupsummary.disable();
            }
            view.refresh();
            me.groupByMonthToggle = !me.groupByMonthToggle;
        } else {
            // Called because the user click 'Group by this field' on any of the other (NOT "Date") column dropdown menus
            btn.setText(me.groupByMonthText[1]);
            me.groupByMonthToggle = true;
        }
    }

    me.SetTotalCost = function() {
        // Get values of other cost components in this row

        /* Can't use record - doesn't have current editor values
        var g = Ext.getCmp('Grid_Trades');
        var sm = g.getSelectionModel();
        var rec = sm.getSelection()[0]; // Only 1 - we're using row selection model

        var buy = (rec.data.Trade == 'BUY');
        var totalCost = (rec.data.TradePrice / 100) * ((buy) ? -1 : 1) * rec.data.Quantity - rec.data.Brokerage - rec.data.Tax;
        */

        var eT = Ext.getCmp('Editor_Trade');
        var eTP = Ext.getCmp('Editor_TradePrice');
        var eQ = Ext.getCmp('Editor_Quantity');
        var eB = Ext.getCmp('Editor_Brokerage');
        var eTx = Ext.getCmp('Editor_Tax');

        var trade = eT.getValue();
        var price = eTP.getValue();
        var quantity = eQ.getValue();
        var brokerage = eB.getValue();
        var tax = eTx.getValue();

        // Calc TotalCost
        var buy = (trade == 'BUY');
        var totalCost = (price / 100) * ((buy) ? -1 : 1) * quantity - brokerage - tax;

        // Set value
        var eTC = Ext.getCmp('Editor_TotalCost');
        eTC.setValue(totalCost);
    }

    return me;
}());

Ext.define('SetableTradeGroupSummary', {
    extend: 'Ext.grid.feature.GroupingSummary', // NB base = Ext.grid.feature.Grouping
    //override: 'Ext.grid.feature.GroupingSummary', // If you override then can't do "new SetableTradeGroupSummary" below
    alias: 'feature.setabletradegroupsummary',

    // New function
    groupBy: function (columnName) {
        // Copied from Ext.grid.feature.Grouping.onGroupMenuItemClick
        var me = this,
            view = me.view,
            store = view.store;

        delete me.lastGroupIndex;
        me.block();
        me.enable();
        store.group(columnName);
        me.pruneGroupedHeader();
        me.unblock();
        me.refreshIf();
    },

    // Override Ext.grid.feature.Grouping.onGroupMenuItemClick
    onGroupMenuItemClick: function (menuItem, e) {
        TradeGridExt.groupByMonth(menuItem.parentMenu.activeHeader.text);    // Change groupBy button text and toggle in the grids toolbar
        this.callParent(arguments);   // Group by the active column
    }
});

Ext.define('DeleteEmptyTradeRowOnCancelEditing', {
    extend: 'Ext.grid.plugin.RowEditing',
    pluginId: 'DeleteEmptyTradeRowOnCancelEditing',
    alias: 'plugin.DeleteEmptyTradeRowOnCancelEditing', // So TradeGrid.plugins can use alias

    errorSummary: false,

    cancelEdit: function () {
        // NOTE: cancelEdit is called via 2 paths:
        //  1. When the cancel button is pushed
        //  2. Prior to adding a new row (refresh causes cancelEdit)
        // In the later case, there is no editing happening - we want to ignore this.
        // If editing is genuinely being cancelled, then check whether it's the first row we cancelled on, and
        // delete it if so (don't leave a row of uninitialised data hanging about).
        var firstRow = this.grid.store.getAt(0);
        if (this.editing === true && firstRow.getId() == 0) {
            this.callParent(arguments);
            this.grid.store.remove(firstRow); // NOTE: Causes cancelEdit to be re-entered, must callParent to close the editor first
        } else {
            this.callParent(arguments);
        }
    },

    startEdit: function (gridRowRecord, columnHeader) {
        // NOTE: all rows share a single instrumentStore. 
        // On Update
        //  1. Clear the instrumentStore before edit
        //  2. Setup existing share code on update
        // On Create just clear the store
        // Don't enter this function on Delete

        // Setup store before callParent()
        if (gridRowRecord === 0) {
            TradeGridExt.instrumentStore.loadData([], false); // false = clear old
        } else {
            TradeGridExt.instrumentStore.loadData([[gridRowRecord.get('Company'), gridRowRecord.get('Code')]], false);
        }
        
        if (this.callParent(arguments) === false) {
            return false;
        }
    }
});

Ext.define('Transactions.view.TradeGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.tradegrid',
    requires: ['Transactions.store.InstrumentStore', 'Transactions.store.TradeStore'],
    id: 'Grid_Trades',
    title: 'Trades',    // NOTE: used in Ext.ComponentQuery
    selType: 'rowmodel',
    plugins: ['DeleteEmptyTradeRowOnCancelEditing'],
    store: 'Transactions.store.TradeStore',
    viewConfig: {
        getRowClass: function(record, rowIndex, rowParams, store){
            switch (record.get("SyncState")) {
                case 'Synced':
                    return "row-valid";
                case 'Syncing':
                    return "row-syncing";
                case 'SyncError':
                    return "row-error";
            }
        }
    },
    dockedItems: [{
        dock: 'top',
        xtype: 'toolbar',
        items: [{
            text: 'Add',
            iconCls: 'icon-add',
            handler: function () {
                // empty record
                TradeGridExt.ignoreRow = true;
                TradeGridExt.grid.store.insert(0, new Transactions.model.TradeModel());    // NOTE: would normally be sent to server RESTfully. However optimisedrest will ignore it.
                TradeGridExt.rowEditing.startEdit(0, 0);
            }
        }, {
            itemId: 'delete',
            text: 'Delete',
            iconCls: 'icon-delete',
            disabled: true,
            handler: function () {
                Ext.MessageBox.confirm('Please confirm', 'Are you sure?', confirmDelete);
                function confirmDelete(btn) {
                    if (btn == "yes") {
                        var selection = TradeGridExt.grid.getView().getSelectionModel().getSelection()[0];
                        if (selection) {
                            TradeGridExt.grid.store.remove(selection);
                            // Reset selection so clicking delete twice doesn't cause same record to be deleted twice
                            var rowSelectionModel = TradeGridExt.grid.getView().getSelectionModel();
                            rowSelectionModel.selectNext(false, false);
                        }
                    }
                };
            }
        }, '-', {
            itemId: 'byMonthUngroup',
            text: TradeGridExt.groupByMonthText[0],
            //iconCls: 'icon-delete',
            //disabled: true,
            handler: function () {
                TradeGridExt.groupByMonth('Date');
            }
        }]
    }],
    features: [new SetableTradeGroupSummary({
        id: 'groupsummary',    // allows view.getFeature('groupsummary') in TradeGridExt.groupByMonth above
        ftype: 'setabletradegroupsummary',
        //hideGroupedHeader: true,
        groupHeaderTpl: '{name}',   // see Transactions.store.TradeStore.getGroupString
        showSummaryRow: true
        //enableGroupingMenu: false
    })],
    columns: [{
        text: 'ID',
        dataIndex: 'ID',
        sortable: true,
        hidden: true,
        width: 20
    }, {
        text: 'Date',
        dataIndex: 'Date',
        renderer: FormatDate,
        field: {
            xtype: 'datefield',
            id: 'Editor_TradeDate',
            // Validation
            format: 'Y-m-d',
            allowBlank: false,
            disabledDays: [0, 6],
            disabledDaysText: 'Can\'t trade on a weekend',
            invalidText: 'Invalid format - use yyyy-mm-dd',
            maxValue: new Date(),
            maxText: "Can't enter future trades",
            //minValue: 1st cash movement - NB must be updated when 1st cash movement changed
            //minText: "The date in this field must be equal to or after {0}",
            maskRe: /[\d\-]/i
        },
        sortable: true,
        width: 68
    }, {
        text: 'Code',
        dataIndex: 'Code',
        sortable: true,
        pageSize: 15,
        width: 40,
        editor: {
            xtype: 'combobox',
            id: 'Editor_Code',
            //renderTo: Ext.getBody(),
            queryMode: 'remote',
            store: 'Transactions.store.InstrumentStore',
            valueField: 'Code',
            //hiddenName: 'Code',
            displayField: 'Company',
            typeAhead: true,
            forceSelection: false,
            hideTrigger: true,
            minChars: 2,
            matchFieldWidth: false,
            listConfig: {
                minWidth: 250
            },
            loadingText: 'Searching...',
            listemptyText: 'No results found...',
            listClass: 'x-combo-list-small',
            // Template for the dropdown menu.
            // Note the use of "x-boundlist-item" class,
            // this is required to make the items selectable.
            tpl: Ext.create('Ext.XTemplate',
                '<tpl for=".">',
                    '<div class="x-boundlist-item"><b>{Code}</b> - {Company}</div>',
                '</tpl>'
            ),
            // template for the content inside text field
            displayTpl: Ext.create('Ext.XTemplate',
                '<tpl for=".">',
                    '{Code}',
                '</tpl>'
            ),
            listeners: {
                select: function (combo, instrumentPickerRecord) {
                    var tradeGridRecord = TradeGridExt.rowEditing.context.record,
                        country = combo.lastSelection[0].raw.Company;
                    tradeGridRecord.beginEdit();
                    tradeGridRecord.set('Company', country);
                    tradeGridRecord.set('Code', combo.lastSelection[0].raw.Code);
                    Ext.getCmp('CompanyEditor').setValue(country);
                    //tradeGridRecord.endEdit();
                    TradeGridExt.grid.getView().refresh();
                }
            }
        }
    }, {
        text: 'Company',
        dataIndex: 'Company',
        hidden: true,
        sortable: true,
        width: 200,
        editor: {
            xtype: 'textfield',
            id: 'CompanyEditor',
            disabled: true
        }
    }, {
        text: 'Country',
        dataIndex: 'Country',
        hidden: true,
        sortable: true,
        width: 100,
    }, {
        text: 'Industry',
        dataIndex: 'ICBCodeIndustry',
        hidden: true,
        sortable: true,
        width: 100
    }, {
        text: 'Super-Sector',
        dataIndex: 'ICBCodeSuperSector',
        hidden: true,
        sortable: true,
        width: 100
    }, {
        text: 'Sector',
        dataIndex: 'ICBCodeSector',
        hidden: true,
        sortable: true,
        width: 100
    }, {
        text: 'Sub-Sector',
        dataIndex: 'ICBCodeSubSector',
        hidden: true,
        sortable: true,
        width: 100
    }, {
        text: 'Type',
        dataIndex: 'Type',
        hidden: true,
        sortable: true,
        width: 40
    }, {
        text: 'Trade',
        dataIndex: 'Trade',
        editor: {
            xtype: 'combobox',
            id: 'Editor_Trade',
            typeAhead: true,
            forceSelection: true,
            triggerAction: 'all',
            selectOnTab: true,
            store: ['BUY', 'SELL'],
            listClass: 'x-combo-list-small',
            listeners: {
                change: function ( newValue, oldValue, eOpts) {
                    TradeGridExt.SetTotalCost();
                }
            },
            validator: function () {
                var cur = this.getValue(),
                    e;

                if (cur == 'BUY' || cur == 'SELL') {
                    return true;
                }

                return 'Must be BUY or SELL';
            }
        },
        sortable: true,
        width: 50
    }, {
        text: 'Quantity',
        dataIndex: 'Quantity',
        sortable: true,
        width: 60,
        summaryType: 'sum',
        editor: {
            xtype: 'numberfield',
            id: 'Editor_Quantity',
            minValue: 1,
            minText: "Quantity must be > 0",
            allowBlank: false,
            listeners: {
                blur: function (a, b) {
                    TradeGridExt.SetTotalCost();
                }
            }
        }
    }, {
        text: 'Trade Price (cents)',
        dataIndex: 'TradePrice',
        sortable: true,
        width: 100,
        editor: {
            xtype: 'numberfield',
            id: 'Editor_TradePrice',
            minValue: 1,
            minText: "Trade price must be > 0",
            allowBlank: false,
            listeners: {
                blur: function (a, b) {
                    TradeGridExt.SetTotalCost();
                }
            }
        }
    }, {
        text: 'Brokerage (R)',
        dataIndex: 'Brokerage',
        renderer: function (value) {
            return GreenRedSAMoney(value * -1);
        },
        sortable: true,
        summaryType: 'sum',
        summaryRenderer: function (value) {
            return GreenRedSAMoney(value * -1);
        },
        width: 90,
        editor: {
            id: 'Editor_Brokerage',
            xtype: 'numberfield',
            minValue: 0,
            minText: "Brokerage must be >= 0",
            allowBlank: false,
            listeners: {
                blur: function (a, b) {
                    TradeGridExt.SetTotalCost();
                }
            }
        }
    }, {
        text: 'Tax (R)',
        dataIndex: 'Tax',
        renderer: function (value) {
            return GreenRedSAMoney(value * -1);
        },
        sortable: true,
        summaryType: 'sum',
        summaryRenderer: function (value) {
            return GreenRedSAMoney(value * -1);
        },
        width: 50,
        editor: {
            xtype: 'numberfield',
            id: 'Editor_Tax',
            minValue: 0,
            minText: "Tax must be >= 0",
            allowBlank: false,
            listeners: {
                blur: function (a, b) {
                    TradeGridExt.SetTotalCost();
                }
            }
        }
    }, {
        text: 'Total Cost (R)',
        dataIndex: 'TotalCost',
        renderer: GreenRedSAMoney,
        sortable: true,
        summaryType: 'sum',
        summaryRenderer: GreenRedSAMoney,
        width: 80,
        editor: {
            xtype: 'numberfield',
            id: 'Editor_TotalCost',
            disabled: true
        }
    }, {
        text: 'Status',
        dataIndex: 'SyncState',
        sortable: false,
        width: 50,
        items: [{
            tooltip: 'Sell stock'
        }],
        renderer: function (value, metaData, record, rowIdx, colIdx, store, view) {
            switch (record.get("SyncState")) {
                case 'Synced':
                    return '<img src="' + _EXTROOT + '/content/synced.gif"/>'; // TODO - icon sprites
                case 'Syncing':
                    return '<img src="' + _EXTROOT + '/content/syncing.gif"/>';
                case 'SyncError':
                    return '<img src="' + _EXTROOT + '/content/syncError.gif"/>';
            }
        }
    }],
    stripeRows: true,
    resizable: {
        handles: 's'
    }
});

