Ext.define('Transactions.store.DrinkStore', {
    extend: 'Ext.data.Store',
    model: 'Transactions.model.DrinkModel',
    autoLoad: true,
    autoSync: false,
    proxy: {
        batchActions: true,
        type: 'rest',
        url: '/Api/Drink',

        reader: {
            type: 'json',
            root: 'data'
        },
        writer: {
            type: 'json',
            allowSingle: false  // ensure always an array is sent, even if only one item
        }
    }
});