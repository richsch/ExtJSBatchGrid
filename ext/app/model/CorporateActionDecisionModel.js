Ext.define("Transactions.model.CorporateActionDecisionModel", {
    extend: 'Ext.data.Model',
    idProperty: "Id",
    fields: [
        { name: "ScripQuantity", type: 'number' },
        { name: "Id", type: 'number' },
        { name: "CorporateActionType", type: 'number' },
        //{ name: "CorporateAction", type: 'CorporateAction' },     // See associations
        { name: "Share", type: 'string' },
        { name: "LDT", type: 'date' },
        { name: "PayDate", type: 'date' },
        { name: "Portfolio", type: 'number' },
        { name: "Quantity", type: 'number' },
        { name: "Resolved", type: 'boolean' }
    ],

    associations: [
        { type: 'hasOne', model: 'CorporateAction', associationKey: 'CorporateAction' }
    ]
});