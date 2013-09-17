Ext.define('Transactions.model.TradeModel', {
    extend: 'Ext.data.Model',
    idProperty: 'ID',
    fields: [
        { name: 'ID', type: 'number' },
        { name: 'Date', type: 'date', dateFormat: 'Y/m/d H:i' }, // TODO - dates consistency
        { name: 'Company', type: 'string' },
        { name: 'Code', type: 'string' },
        { name: 'Country', type: 'string' },
        { name: 'ICBCodeIndustry', type: 'string' },
        { name: 'ICBCodeSuperSector', type: 'string' },
        { name: 'ICBCodeSector', type: 'string' },
        { name: 'ICBCodeSubSector', type: 'string' },
        { name: 'Type', type: 'string' },
        { name: 'Trade' }, // BUY/SELL
        { name: 'Quantity', type: 'float' },
        { name: 'TradePrice', type: 'float' },
        { name: 'Brokerage', type: 'float' },
        { name: 'Tax', type: 'float' },
        { name: 'TotalCost', type: 'float' },
        { name: 'SyncState', type: 'string', defaultValue: 'Synced', persist: false },      // Used internally to toggle C/S validation & S/S input & action errors - see getRowClass(..) & syncError(..)
        { name: 'SyncErrorMessage', type: 'string', defaultValue: '', persist: false }      // Used internally to preserve S/S input & action errors - see syncError(..)
    ]
});