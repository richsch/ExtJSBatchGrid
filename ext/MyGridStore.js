Ext.override(Ext.Component, {
    toJQuery: function () {
        return $(this.getEl().dom);
    }
});

function Round(number, digits) {
    var multiple = Math.pow(10, digits);
    var rndedNum = Math.round(number * multiple) / multiple;
    return rndedNum;
};

function SAMoney(v) {
    /*if (typeof v === 'undefined')
        return '';*/
    if (v == null)
        return '';
    else if (isNaN(v))
        return '';
    else
        return Ext.util.Format.currency(v, 'R', 2);
}

function GreenRedSAMoney(v) {
    if (v == null) {
        return v;
    }

    if (v == 0) {
        return SAMoney(v);
    } else if (v > 0) {
        return '<span style="color:green;">' + SAMoney(v) + '</span>';
    } else {
        return '<span style="color:red;">' + SAMoney(v) + '</span>';
    }
}

function GreenRedNumber(v) {
    if (v == null) {
        return v;
    }

    if (v == 0) {
        return '0';
    } else if (v > 0) {
        return '<span style="color:green;">' + Round(v, 2) + '</span>';
    } else {
        return '<span style="color:red;">' + Round(v, 2) + '</span>';
    }
}

function GreenRedPercent(v) {
    if (v == null) {
        return v;
    }

    if (v == 0) {
        return '0%';
    } else if (v > 0) {
        return '<span style="color:green;">' + Round(v * 100, 2) + '%</span>';
    } else {
        return '<span style="color:red;">' + Round(v * 100, 2) + '%</span>';
    }
}

function FormatDate(value) {
    return value ? Ext.Date.dateFormat(value, 'Y-m-d') : '';
}


/* ===========================================
					TRADE GRID
	========================================== */
	
var CashGridExt = (function () {
    var me = {};

    me.controller = null;
    me.grid = null;
    me.store = null;
    me.rowEditing = null;
    me.ignoreRow = false;
    me.groupByMonthToggle = false;
    me.groupByMonthText = ['By Month', 'Ungroup'];

    me.init = function (grid, controller, suppressDisableGroup) {
        me.grid = grid;
        me.controller = controller;
        me.store = grid.getStore();
        me.rowEditing = grid.getPlugin('DeleteEmptyCashRowOnCancelEditing');

        grid.getSelectionModel().on('selectionchange', function (selModel, selections) {
            grid.down('#delete').setDisabled(selections.length === 0);
        });

        if (!suppressDisableGroup) {
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

    return me;
}());


Ext.define('SetableGroupSummary', {
    extend: 'Ext.grid.feature.GroupingSummary', // NB base = Ext.grid.feature.Grouping
    //override: 'Ext.grid.feature.GroupingSummary', // If you override then can't do "new SetableGroupSummary" below
    alias: 'feature.setablegroupsummary',

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
        CashGridExt.groupByMonth(menuItem.parentMenu.activeHeader.text);    // Change groupBy button text and toggle in the grids toolbar
        this.callParent(arguments);   // Group by the active column
    }
});

Ext.define('DeleteEmptyCashRowOnCancelEditing', {
    extend: 'Ext.grid.plugin.RowEditing',
    pluginId: 'DeleteEmptyCashRowOnCancelEditing',
    alias: 'plugin.DeleteEmptyCashRowOnCancelEditing', // So CashGrid.plugins can use alias

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
    }
});

Ext.define('Transactions.view.CashGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.cashgrid',
    id: 'Grid_Cash',
    title: 'Cash',
    selType: 'rowmodel',
    plugins: ['DeleteEmptyCashRowOnCancelEditing'],
    //store: 'Transactions.store.CashStore',
    viewConfig: {
        getRowClass: function (record, rowIndex, rowParams, store) {
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
                CashGridExt.ignoreRow = true;
                CashGridExt.store.insert(0, new Transactions.model.CashModel());   // NOTE: would normally be sent to server RESTfully. However optimisedrest will ignore it.
                CashGridExt.rowEditing.startEdit(0, 0);
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
                        var selection = CashGridExt.grid.getView().getSelectionModel().getSelection()[0];
                        if (selection) {
                            CashGridExt.store.remove(selection);
                            // Reset selection so clicking delete twice doesn't cause same record to be deleted twice
                            var rowSelectionModel = CashGridExt.grid.getView().getSelectionModel();
                            rowSelectionModel.selectNext(false, false);
                        }
                    }
                }
            }
        }, '-', {
            itemId: 'byMonthUngroup',
            text: CashGridExt.groupByMonthText[0],
            //iconCls: 'icon-delete',
            //disabled: true,
            handler: function () {
                CashGridExt.groupByMonth('Date');
            }
        }]
    }],
    features: [new SetableGroupSummary({
        id: 'groupsummary',    // allows view.getFeature('groupsummary') in CashGridExt.groupByMonth above
        ftype: 'setablegroupsummary',
        //hideGroupedHeader: true,
        groupHeaderTpl: '{name}',   // see Transactions.store.CashStore.getGroupString
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
            format: 'Y-m-d',
            allowBlank: false,
            maxValue: new Date(),  // Not greater than today
            maxText: 'Can\'t enter future cash movements',
            invalidText: 'Invalid format - use yyyy-mm-dd',
            maskRe: /[\d\-]/i
        },
        sortable: true,
        width: 68
    }, {
        text: 'Type',
        dataIndex: 'Type',
        field: {
            xtype: 'combobox',
            typeAhead: true,
            forceSelection: true,
            triggerAction: 'all',
            selectOnTab: true,
            store: ['DEPOSIT', 'WITHDRAWAL'],
            listClass: 'x-combo-list-small',
            validator: function () {
                var cur = this.getValue(),
                    e;

                if (cur == 'DEPOSIT' || cur == 'WITHDRAWAL') {
                    return true;
                }

                return 'Must be DEPOSIT or WITHDRAWAL';
            }
        },
        sortable: true,
        width: 68
    }, {
        text: 'Amount',
        dataIndex: 'Amount',
        sortable: true,
        summaryRenderer: GreenRedSAMoney,
        /* Can't use default sum - if you group various WITHDRAWALS and DEPOSITS by month they'll be added together
        summaryType: 'sum',*/
        summaryType: function (records) {
            //NRCommon.DebugLog("CashGrid.column[Amount].summaryType: num records = " + records.length);

            var i = 0,
                length = records.length,
                total = 0,
                sign = 1,
                record;

            for (; i < length; ++i) {
                record = records[i];
                if (record.get('Type') == 'WITHDRAWAL') {
                    sign = -1;
                } else {
                    sign = 1;
                }
                total += record.get('Amount') * sign;
            }
            return total;
        },
        renderer: function (value, metaData, record, rowIdx, colIdx, store, view) {
            var sign = 1;
            if (record.get('Type') == 'WITHDRAWAL') {
                sign = -1;
            }
            return GreenRedSAMoney(value * sign);
        },
        //flex: 1,
        width: 90,
        editor: {
            xtype: 'numberfield',
            allowBlank: false,
            minValue: 1,
            minText: "Amount must be > 0"
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
                    return '<img src="' + _EXTROOT + '/transactions/content/synced.gif"/>'; // TODO icon sprites
                case 'Syncing':
                    return '<img src="' + _EXTROOT + '/transactions/content/syncing.gif"/>';
                case 'SyncError':
                    return '<img src="' + _EXTROOT + '/transactions/content/syncError.gif"/>';
            }
        }
    }],
    stripeRows: true,
    resizable: {
        handles: 's'
    }
});

Ext.define('Transactions.model.CashModel', {
    extend: 'Ext.data.Model',
    idProperty: 'ID',
    fields: [
        { name: 'ID', type: 'number' },
        { name: 'Date', type: 'date', dateFormat: 'Y/m/d H:i' }, // TODO - dates consistency
        //{ name: 'Time', type: 'string' }, // hh:mm
        { name: 'Type' }, // DEPOSIT/WITHDRAWAL
        { name: 'Amount', type: 'float' },
        { name: 'SyncState', type: 'string', defaultValue: 'Synced', persist: false },      // Used internally to toggle C/S validation & S/S input & action errors - see getRowClass(..) & syncError(..)
        { name: 'SyncErrorMessage', type: 'string', defaultValue: '', persist: false }      // Used internally to preserve S/S input & action errors - see syncError(..)
    ]
});

Ext.define('OptimisedCashRest', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.optimisedcashrest',
    doRequest: function (operation, callback, scope) {
        // operation.action = create, read, update, destroy
        if (operation.action == 'create' && CashGridExt.ignoreRow == true) {
            // An uninitialised record has been added to the store
            CashGridExt.ignoreRow = false;
            return;
        }

        return this.callParent(arguments);
    }
});

Ext.define('Transactions.store.CashStore', {
    extend: 'Ext.data.Store',
    model: 'Transactions.model.CashModel',
    autoLoad: true,
    autoSync: true,
    data: (_INDEXHTML === true) ? {
        "success": true,
        "message": "1 cash movements loaded",
        "data": [{ "ID": 474, "Date": "2011/01/01 00:00", "Type": "DEPOSIT", "Amount": 10501.00 }]
    } : window.NR_CashMove_Data ? window.NR_CashMove_Data : null,
    proxy: {
        type: (_INDEXHTML === true || window.NR_CashMove_Data) ? 'memory' : 'optimisedcashrest',
        url: '/Cash/REST/' + window.CSRFToken + '/' + TransactionInputsBarServerSide.inputs.portfolio,
        reader: {
            type: 'json',
            root: 'data'
        },
        writer: {
            type: 'json'
        },
        listeners: {
            exception: function (proxy, response, operation) {
                //TransactionComms.handleServerSideException(CashGridExt.grid, response);
            }
        }
    },
    listeners: {
        write: function (store, operation) {
            //TransactionComms.handleServerResponse(CashGridExt.grid, operation, 'cash movement');
        },
        beforesync: function (options, eOpts) {
            if (options.create !== undefined) {
                Ext.Array.each(options.create, function (record) {
                    var y = CashGridExt.grid.store.findExact('ID', record.data.ID);
                    if (y != -1) {
                        //TransactionComms.syncInProgress(CashGridExt.grid, y);
                    }
                });
            }
            if (options.update !== undefined) {
                Ext.Array.each(options.update, function (record) {
                    // Can't rely on record.index to be accurate in the event of deletes
                    // record.raw is sometimes undefined
                    var y = CashGridExt.grid.store.findExact('ID', record.data.ID);
                    if (y != -1) {
                        //TransactionComms.syncInProgress(CashGridExt.grid, y);
                    }
                });
            }
            /* Don't need to update icon on delete - there's no row to update anymore
            if (options.destroy !== undefined) {
                Ext.Array.each(options.destroy, function (record) {
                    if (record.index !== undefined) {
                        TransactionComms.syncInProgress(CashGridExt.grid, 0);
                    }
                });
            }
            */
        }
    },
    groupField: 'Date',
    getGroupString: function (instance) {
        var group = this.groupers.first();
        if (group) {
            if (group.property == 'Date') {
                return Ext.Date.format(instance.get(group.property), 'M Y');
            }
            return instance.get(group.property);
        }
        return '';
    }
});


Ext.onReady(function () {
    Ext.create('Ext.container.Container', {
        renderTo: Ext.getBody(),
        width: 700,
        height: 530,

        items: [{
            xtype: 'cashgrid',
            id: 'cashgrid',
            margin: '10 10 0 10',
            maxHeight: 350,
            width: 380,
            style: {
                "background-color": 'white'
            }
        }]
    });
});