Ext.define('Transactions.store.SportStore', {
    extend: 'Ext.data.Store',
    model: 'Transactions.model.SportModel',
    autoLoad: true,
    autoSync: false,
    data: {
        "success": true,
        "message": "1 cash movements loaded",
        "data": [{ "ID": 474, "Sport": "Tennis", "IsNew": false },
                 { "ID": 475, "Sport": "Rugby", "IsNew": false },
                 { "ID": 476, "Sport": "Cricket", "IsNew": false }]
    } ,
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