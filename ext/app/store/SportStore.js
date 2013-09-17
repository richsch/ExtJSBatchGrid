Ext.define('Transactions.store.SportStore', {
    extend: 'Ext.data.Store',
    model: 'Transactions.model.SportModel',
    autoLoad: true,
    autoSync: false,
//    data: {
//        "success": true,
//        "message": "1 cash movements loaded",
//        "data": [{ "ID": 474, "Sport": "Tennis", "IsNew": false },
//                 { "ID": 475, "Sport": "Rugby", "IsNew": false },
//                 { "ID": 476, "Sport": "Cricket", "IsNew": false }]
//    } ,
    proxy: {
        batchActions: true,
        type: 'rest',
        url: '/Api/Sport',

//        type: 'ajax',
//        api: {
//            read: 'app.php/users/view',
//            create: 'app.php/users/create',
//            update: 'app.php/users/update',
//            destroy: 'app.php/users/destroy'
//        },
//        reader: {
//            type: 'json',
//            successProperty: 'success',
//            root: 'data',
//            messageProperty: 'message'
//        },
//        writer: {
//            type: 'json',
//            writeAllFields: false,
//            root: 'data'
//        },
        
        reader: {
            type: 'json',
            root: 'data'
        },
        writer: {
            type: 'json'
        }
    }
});