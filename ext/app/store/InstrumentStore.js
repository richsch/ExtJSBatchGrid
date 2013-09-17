Ext.define('Transactions.store.InstrumentStore', {
    extend: 'Ext.data.Store',
    model: 'Transactions.model.InstrumentModel',
    autoLoad: false,
    proxy: {
        type: 'ajax',
        url: 'Trade/Instruments/',
        reader: {
            type: 'json',
            root: 'chartData'
        }
    }
});
