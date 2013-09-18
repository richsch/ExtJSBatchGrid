Ext.define('Transactions.model.SportModel', {
    extend: 'Ext.data.Model',
    idProperty: 'ID',
    fields: [
        { name: 'ID', type: 'number', defaultValue: -1 },
        { name: 'Sport', type: 'string' },
        { name: 'IsNew', type: 'bool', defaultValue: true},
        { name: 'ModelType', type: 'string', defaultValue: 'SportModel'},
        { name: 'SyncState', type: 'string', defaultValue: 'Synced', persist: false },      // Used internally to toggle C/S validation & S/S input & action errors - see getRowClass(..) & syncError(..)
        { name: 'SyncErrorMessage', type: 'string', defaultValue: '', persist: false }      // Used internally to preserve S/S input & action errors - see syncError(..)
    ]
});
