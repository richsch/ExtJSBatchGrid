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

Ext.require('Transactions.store.BatchProxy');

var DrinkGridExt = (function () {
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
        me.rowEditing = grid.getPlugin('DeleteEmptyDrinkRowOnCancelEditing');

        BatchProxyHandler.registerStore(me.store);

        grid.getSelectionModel().on('selectionchange', function (selModel, selections) {
            grid.down('#delete').setDisabled(selections.length === 0);
        });

        me.store.addListener('rejected', function(g) {
            if (g.getModifiedRecords().length > 0 || g.getRemovedRecords().length > 0) {
                grid.down('#cancel').setDisabled(false);
                grid.down('#save').setDisabled(false);
            } else {
                grid.down('#cancel').setDisabled(true);
                grid.down('#save').setDisabled(true);
            }
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
        me.store.fireEvent('rejected', me.store);   // we need to manually fire this event as no event is triggered after rejecting changes
    }

    return me;
}());

Ext.define('DeleteEmptyDrinkRowOnCancelEditing', {
    extend: 'Ext.grid.plugin.RowEditing',
    pluginId: 'DeleteEmptyDrinkRowOnCancelEditing',
    alias: 'plugin.DeleteEmptyDrinkRowOnCancelEditing', // So DrinkGrid.plugins can use alias

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

Ext.define('Transactions.view.DrinkGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.drinkgrid',
    id: 'Grid_Drink',
    title: 'Drink',
    selType: 'rowmodel',
    plugins: ['DeleteEmptyDrinkRowOnCancelEditing'],
    store: 'Transactions.store.DrinkStore',
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
                DrinkGridExt.ignoreRow = true;
                DrinkGridExt.store.insert(0, new Transactions.model.DrinkModel());   // NOTE: would normally be sent to server RESTfully. However optimisedrest will ignore it.
                DrinkGridExt.rowEditing.startEdit(0, 0);
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
                        var selection = DrinkGridExt.grid.getView().getSelectionModel().getSelection()[0];
                        if (selection) {
                            DrinkGridExt.store.remove(selection);
                            // Reset selection so clicking delete twice doesn't cause same record to be deleted twice
                            var rowSelectionModel = DrinkGridExt.grid.getView().getSelectionModel();
                            rowSelectionModel.selectNext(false, false);
                        }
                    }
                }
            }
        }, {
            itemId: 'cancel',
            text: 'Cancel',
            disabled: true,
            handler: function () {
                DrinkGridExt.undoChanges();
            }
        }, {
            itemId: 'save',
            text: 'Save',
            disabled: true,
            handler: function() {
                DrinkGridExt.store.sync();
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
        text: 'Drink',
        dataIndex: 'Type',
        sortable: true,
        width: 68,
        editor: {
            xtype: 'textfield',
            id: 'Drink_Type',
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