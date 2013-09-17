Ext.define('Transactions.store.DrinkStore', {
    extend: 'Ext.data.Store',
    model: 'Transactions.model.DrinkModel',
    autoLoad: true,
    autoSync: false,
    data: {
        "success": true,
        "message": "1 cash movements loaded",
        "data": [{ "ID": 474, "Type": "Vodka" },
                 { "ID": 475, "Type": "Wine" },
                 { "ID": 476, "Type": "Beer" }]
    },
    proxy: {
        batchActions: true,
        type: 'memory',
        reader: {
            type: 'json',
            root: 'data'
        },
        writer: {
            type: 'json'
        }
    }
});