Ext.define('Transactions.model.CashBalanceModel', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'Amount', type: 'number' },
        { name: 'DateTime', type: 'number' },
        { name: 'Event', type: 'text' }
    ]
});