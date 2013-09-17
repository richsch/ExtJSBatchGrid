Ext.define('Transactions.store.TradeStore', {
    extend: 'Ext.data.Store',
    model: 'Transactions.model.TradeModel',
    autoLoad: true,
    autoSync: true,
    autoSave: false,    // TODO - check
    batch: true,
    data: (_INDEXHTML === true) ? {
        "success": true,
        "message": "2 trades loaded",
        "data": [{
            "ID": 357, "Date": "2011/09/06 00:00", "Company": "Hosken Consolidated Investment", "Code": "HCI", "Country": "SOUTH AFRICA", "ICBCodeIndustry": "FINANCIALS", "ICBCodeSuperSector": "INVESTMENT INSTRUMENTS", "ICBCodeSector": "EQUITY INVESTMENT INSTRUMENTS", "ICBCodeSubSector": "EQUITY INVESTMENT INSTRUMENTS", "Type": "Common Stock", "Trade": "BUY", "Quantity": 1.00, "TradePrice": 8100.00, "Brokerage": 0.00, "Tax": 0.00, "TotalCost": -81.0000
        }, {
            "ID": 359, "Date": "2012/12/12 00:00", "Company": "Hosken Consolidated Investment", "Code": "HCI", "Country": "SOUTH AFRICA", "ICBCodeIndustry": "FINANCIALS", "ICBCodeSuperSector": "INVESTMENT INSTRUMENTS", "ICBCodeSector": "EQUITY INVESTMENT INSTRUMENTS", "ICBCodeSubSector": "EQUITY INVESTMENT INSTRUMENTS", "Type": "Common Stock", "Trade": "BUY", "Quantity": 200.00, "TradePrice": 10000.00, "Brokerage": 1.00, "Tax": 10.00, "TotalCost": -20011.0000
        }]
    } : window.NR_Trades_Data ? window.NR_Trades_Data : null,
    proxy: {
        type: (_INDEXHTML === true || window.NR_Trades_Data) ? 'memory' : 'rest',
        //type: 'rest',
        url: '/Trade/REST/' + window.CSRFToken + '/' + TransactionInputsBarServerSide.inputs.portfolio,
        reader: {
            type: 'json',
            root: 'data'
        },
        writer: {
            type: 'json'
        },
        listeners: {
            exception: function (proxy, response, operation) {
                TransactionComms.handleServerSideException(TradeGridExt.grid, response);
            }
        }
    },
    listeners: {
        write: function (store, operation) {
            TransactionComms.handleServerResponse(TradeGridExt.grid, operation, 'trade');
        },
        beforesync: function (options, eOpts) {
            if (options.create !== undefined) {
                Ext.Array.each(options.create, function (record) {
                    var y = TradeGridExt.grid.store.findExact('ID', record.data.ID);
                    if (y != -1) {
                        TransactionComms.syncInProgress(TradeGridExt.grid, y);
                    }
                });
            }
            if (options.update !== undefined) {
                Ext.Array.each(options.update, function (record) {
                    // Can't rely on record.index to be accurate in the event of deletes
                    // record.raw is sometimes undefined
                    var y = TradeGridExt.grid.store.findExact('ID', record.data.ID);
                    if (y != -1) {
                        TransactionComms.syncInProgress(TradeGridExt.grid, y);
                    }
                });
            }
            /* Don't need to update icon on delete - there's no row to update anymore
            if (options.destroy !== undefined) {
                Ext.Array.each(options.destroy, function (record) {
                    if (record.index !== undefined) {
                        TransactionComms.syncInProgress(TradeGridExt.grid, 0);
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