/*
TODO - resolve requirements by using ext-dev.js
Ext.require([
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.util.*',
    'Ext.state.*',
    'Ext.window.MessageBox'
]);
*/

//Ext.require([
//    'Transactions.module.TransactionComms'
//]);

var SportGridExt = (function () {
    var me = {};

    me.controller = null;
    me.grid = null;
    me.store = null;
    me.rowEditing = null;
    me.ignoreRow = false;

    me.init = function (grid, controller, suppressDisableGroup) {
        me.grid = grid;
        me.controller = controller;
        me.store = grid.getStore();
        me.rowEditing = grid.getPlugin('DeleteEmptySportRowOnCancelEditing');

        grid.getSelectionModel().on('selectionchange', function (selModel, selections) {
            grid.down('#delete').setDisabled(selections.length === 0);
        });
        me.store.addListener('datachanged', function (g, eOpts) {
            if (g.getModifiedRecords().length > 0 || g.getRemovedRecords().length > 0) {
                grid.down('#cancel').setDisabled(false);
                grid.down('#save').setDisabled(false);
            } else {
                grid.down('#cancel').setDisabled(true);
                grid.down('#save').setDisabled(true);
            }
        });
    }

    me.undoChanges = function () {
        me.store.rejectChanges();

        // need to handle the cancel case manually - no event is fire after the reject is complete
        me.grid.down('#cancel').setDisabled(true);
        me.grid.down('#save').setDisabled(true);
    }

    return me;
}());

Ext.define('DeleteEmptySportRowOnCancelEditing', {
    extend: 'Ext.grid.plugin.RowEditing',
    pluginId: 'DeleteEmptySportRowOnCancelEditing',
    alias: 'plugin.DeleteEmptySportRowOnCancelEditing', // So SportGrid.plugins can use alias

    errorSummary: false,

    cancelEdit: function (grid, eOpts) {
        // NOTE: cancelEdit is called via 2 paths:
        //  1. When the cancel button is pushed
        //  2. Prior to adding a new row (refresh causes cancelEdit)
        // In the later case, there is no editing happening - we want to ignore this.
        // If editing is genuinely being cancelled, then check whether it's the first row we cancelled on, and
        // delete it if so (don't leave a row of uninitialised data hanging about).
        var firstRow = this.grid.store.getAt(0);
        if (this.editing === true && firstRow.data["IsNew"]) {
            this.callParent(arguments);
            this.grid.store.remove(firstRow); // NOTE: Causes cancelEdit to be re-entered, must callParent to close the editor first
        } else {
            this.callParent(arguments);
        }
    },
    
    listeners: {
        edit: function (editor, e, opt) {
            e.record.data["IsNew"] = false;
        }
    },
});

Ext.define('Transactions.view.SportGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.sportgrid',
    id: 'Grid_Sport',
    title: 'Sport',
    selType: 'rowmodel',
    plugins: ['DeleteEmptySportRowOnCancelEditing'],
    store: 'Transactions.store.SportStore',
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
                SportGridExt.ignoreRow = true;
                SportGridExt.store.insert(0, new Transactions.model.SportModel());   // NOTE: would normally be sent to server RESTfully. However optimisedrest will ignore it.
                SportGridExt.rowEditing.startEdit(0, 0);
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
                        var selection = SportGridExt.grid.getView().getSelectionModel().getSelection()[0];
                        if (selection) {
                            SportGridExt.store.remove(selection);
                            // Reset selection so clicking delete twice doesn't cause same record to be deleted twice
                            var rowSelectionModel = SportGridExt.grid.getView().getSelectionModel();
                            rowSelectionModel.selectNext(false, false);
                        }
                    }
                }
            }
        }, {
            itemId: 'cancel',
            text: 'Cancel',
            disabled: true,
            handler: function() {
                SportGridExt.undoChanges();
            }
        }, {
            itemId: 'save',
            text: 'Save',
            disabled: true,
            handler: function() {
                SportGridExt.store.sync();
            }
        }]
    }],
    columns: [{
        text: 'ID',
        dataIndex: 'ID',
        sortable: true,
        hidden: true,
        width: 20
    }, {
        text: 'Sport',
        dataIndex: 'Sport',
        sortable: true,
        width: 68,
        editor: {
            xtype: 'textfield',
            id: 'Sport_Type',
            allowBlank: false,
            listeners: {
                blur: function (a, b) {
                }
            }
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
                    return '<img src="' + _EXTROOT + '/content/synced.gif"/>'; // TODO icon sprites
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