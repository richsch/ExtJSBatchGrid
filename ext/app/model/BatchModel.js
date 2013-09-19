Ext.define('Transactions.model.BatchModel', {
    extend: 'Ext.data.Model',
    idProperty: 'ID',
    fields: [
        { name: 'ID', type: 'number', defaultValue: -1 },
        { name: 'ModelType', type: 'string' },
        { name: 'Data', type: 'object' }
    ]
});
