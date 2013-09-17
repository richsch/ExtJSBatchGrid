Ext.define('Transactions.model.CashModel', {
    extend: 'Ext.data.Model',
    idProperty: 'ID',
    fields: [
        { name: 'ID', type: 'number' },
        { name: 'Date', type: 'date', dateFormat: 'Y/m/d H:i' }, // TODO - dates consistency
        //{ name: 'Time', type: 'string' }, // hh:mm
        { name: 'Type' }, // DEPOSIT/WITHDRAWAL
        { name: 'Amount', type: 'float' },
        { name: 'SyncState', type: 'string', defaultValue: 'Synced', persist: false },      // Used internally to toggle C/S validation & S/S input & action errors - see getRowClass(..) & syncError(..)
        { name: 'SyncErrorMessage', type: 'string', defaultValue: '', persist: false }      // Used internally to preserve S/S input & action errors - see syncError(..)
    ]
});
