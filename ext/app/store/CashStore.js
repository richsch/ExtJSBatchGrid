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
                TransactionComms.handleServerSideException(CashGridExt.grid, response);
            }
        }
    },
    listeners: {
        write: function (store, operation) {
            TransactionComms.handleServerResponse(CashGridExt.grid, operation, 'cash movement');
        },
        beforesync: function (options, eOpts) {
            if (options.create !== undefined) {
                Ext.Array.each(options.create, function (record) {
                    var y = CashGridExt.grid.store.findExact('ID', record.data.ID);
                    if (y != -1) {
                        TransactionComms.syncInProgress(CashGridExt.grid, y);
                    }
                });
            }
            if (options.update !== undefined) {
                Ext.Array.each(options.update, function (record) {
                    // Can't rely on record.index to be accurate in the event of deletes
                    // record.raw is sometimes undefined
                    var y = CashGridExt.grid.store.findExact('ID', record.data.ID);
                    if (y != -1) {
                        TransactionComms.syncInProgress(CashGridExt.grid, y);
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