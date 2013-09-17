Ext.define('Transactions.model.WarningsModel', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'From', type: 'date' },
        { name: 'To', type: 'date' },
        { name: 'Type' },
        { name: 'Warning' }
    ]
});