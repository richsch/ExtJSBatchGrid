Ext.define("Transactions.model.CorporateAction.DividendModel", {
    extend: 'Ext.data.Model',
    idProperty: "Id",
    fields: [
        { name: "Id", type: 'number' },
        // Dividend
        { name: "Share", type: 'string' },
        { name: "Description", type: 'string' },
        { name: "DeclDate", type: 'date' },
        { name: "LDTDate", type: 'date' },
        { name: "PayDate", type: 'date' },
        { name: "AmountPaidCcy", type: 'number' },
        { name: "Ccy", type: 'string' },
        { name: "ExRate", type: 'number' },
        { name: "Scrip100", type: 'number' },
        { name: "AmountPaidZARc", type: 'number' }
    ]
});
