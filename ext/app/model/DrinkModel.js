﻿Ext.define('Transactions.model.DrinkModel', {
    extend: 'Ext.data.Model',
    idProperty: 'ID',
    fields: [
        { name: 'ID', type: 'number' },
        { name: 'Type', type: 'string' },
        { name: 'IsNew', type: 'bool', defaultValue: true },
        { name: 'ModelType', type: 'string', defaultValue: 'DrinkModel' },
        { name: 'SyncState', type: 'string', defaultValue: 'Synced'},      // Used internally to toggle C/S validation & S/S input & action errors - see getRowClass(..) & syncError(..)
        { name: 'SyncErrorMessage', type: 'string', defaultValue: '' }      // Used internally to preserve S/S input & action errors - see syncError(..)
    ]
});
