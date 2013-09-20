//Ext.define('BatchProxy', {
//    extend: 'Ext.data.proxy.Rest',
//    alias: 'proxy.batchproxy',
//    batchActions: true,
//    doRequest: function (operation, callback, scope) {
//        // operation.action = create, read, update, destroy
//        if (operation.action == 'create') {
//            
//        }
//        if (operation.action == 'update') {
//            
//        }
//        if (operation.action == 'destroy') {
//            
//        }
//
//        return this.callParent(arguments);
//    }
//});
Ext.define('Transactions.store.BatchProxy', {});

var BatchProxyHandler = (function () {
    var me = {};

    me.stores = [];
    me.callbacks = [];

    me.cancelButton = undefined;
    me.saveButton = undefined;
    
    me.registerStore = function(store) {
        if (me.stores.indexOf(store) > -1)
            return;

        me.stores.push(store);

        store.addListener('datachanged', me.checkStoreStatus);
        store.addListener('add', me.checkStoreStatus);
        store.addListener('remove', me.checkStoreStatus);
        store.addListener('update', me.checkStoreStatus);
        store.addListener('rejected', me.checkStoreStatus);
    }
    
    me.checkStoreStatus = function (g, eOpts) {
        if (me.cancelButton === undefined || me.saveButton === undefined)
            return;

        var changes = true;
        for (var i = 0; i < me.stores.length; i++) {
            var store = me.stores[i];
            if (store.getModifiedRecords().length > 0 || store.getRemovedRecords().length > 0) {
                me.cancelButton.setDisabled(false);
                me.saveButton.setDisabled(false);
                changes = false;
            }
        }
        if (changes) {
            me.cancelButton.setDisabled(true);
            me.saveButton.setDisabled(true);
        }
    }

    me.sync = function () {
        var updates = getStoreSyncData();
        
        Ext.Ajax.request({
            url: '/Api/Batch',
            method: 'POST',
            jsonData: updates,
            success: handleStoreSyncResponse,
            failure: function (response, opts) {
                alert('server-side failure with status code ' + response.status + '. Message: '+ response.responseText);
                console.log('server-side failure with status code ' + response.status);
            }
        });
    }
    
    function handleStoreSyncResponse(response, opts) {
        var results = Ext.decode(response.responseText);
        for (var i = 0; i < results.length; i++) {
            var store = getStore(results[i].Store);

            handleStoreCreates(store, results[i].Create);
            handleStoreUpdates(store);
            handleStoreDeletes(store);
            store.fireEvent('datachanged', store);
        }
    }
    
    function handleStoreDeletes(store) {
        // to commit deletes, simply clear out store's collection
        // of removed items
        store.removed.length = 0;
    }
    
    function handleStoreUpdates(store) {
        // commit each record that was changed
        var updates = store.getUpdatedRecords();
        for (var i = 0; i < updates.length; i++) {
            if (updates[i].index != undefined) {
                updates[i].commit();
            }
        }
    }

    function handleStoreCreates(store, results) {
        // for each added record, find it in the results object (using internalId)
        // and update the ID of the record with the new ID from the server/DB
        var added = store.getNewRecords();
        for (var i = 0; i < added.length; i++) {
            var record = getRecordWithInternalId(added[i].internalId, results);
            if (record != undefined) {
                added[i].set('ID', record.ID);
                added[i].commit();
            }
        }
    }
    
    function getRecordWithInternalId(internalId, list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].InternalId === internalId)
                return list[i].Data;
        }
        return undefined;
    }

    function getStore(storeId) {
        for (var i = 0; i < me.stores.length; i++) {
            if (me.stores[i].storeId === storeId)
                return me.stores[i];
        }
        return undefined;
    }
    
    function getStoreSyncData() {
        var results = [];
        for (var i = 0; i < me.stores.length; i++) {
            var s = me.stores[i];

            var deletions = s.getRemovedRecords();
            var additions = s.getNewRecords();
            var updates = s.getUpdatedRecords();

            if (deletions.length > 0 || additions.length > 0 || updates.length > 0) {
                results.push({
                    Store: s.storeId,
                    Create: createTuple(additions),
                    Update: createTuple(updates),
                    Destroy: createTuple(deletions),
                });
            }
        }
        return results;
    }
    
    // creates tuple of internalId and record's data
    // filtering is needed for Addition & Update -> added records
    // are also returned by the getModifiedRecords() call
    function createTuple(records, filterIndex, hasIndex) {
        var result = [];
        for (var i = 0; i < records.length; i++) {
            result.push({ internalId: records[i].internalId, data: records[i].data });
        }
        return result;
    }
    
    me.rejectChanges = function() {
        for (var i = 0; i < me.stores.length; i++) {
            if (me.stores[i].getModifiedRecords().length > 0 || me.stores[i].getRemovedRecords().length > 0) {
                me.stores[i].rejectChanges();
                me.stores[i].fireEvent('rejected', me.stores[i]);   // we need to manually fire this event as no event is triggered after rejecting changes
            }
        }
    }

    return me;
}()); 