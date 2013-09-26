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
    me.statusLabel = undefined;
    
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
                window.onbeforeunload = unloadMessage;
                changes = false;
                var deletions = store.getRemovedRecords().length;
                var additions = store.getNewRecords().length;
                var updates = store.getUpdatedRecords().length;
                var msg = additions + ' add(s), ' + updates + ' update(s), ' + deletions + ' deletion(s) pending';
                me.statusLabel.setText(msg);
            }
        }
        if (changes) {
            me.cancelButton.setDisabled(true);
            me.saveButton.setDisabled(true);
            window.onbeforeunload = null;
            if (me.statusLabel) {
                me.statusLabel.setText('');
            }
        }
    }
    
    function unloadMessage() {
        return 'You have unsaved changes. Are you sure you wish to leave this page?';
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
        var responseData = Ext.decode(response.responseText);
        if (responseData.success) {
            var results = responseData.data;
            for (var i = 0; i < results.length; i++) {
                var store = getStore(results[i].Store);

                handleStoreCreates(store, results[i].Create);
                handleStoreUpdates(store);
                handleStoreDeletes(store);
                store.fireEvent('datachanged', store);
            }
        } else {
            handleStoreErrors(responseData.data);
        }
    }
    
    function handleStoreErrors(data) {
        for (var i = 0; i < data.length; i++) {
            var store = getStore(data[i].Store);
            
            if (data[i].Create.Errors.length > 0) {
                handleStoreDataErrors(store, data[i].Create.Errors);
            }
            if (data[i].Update.Errors.length > 0) {
                handleStoreDataErrors(store, data[i].Update.Errors);
            }
            if (data[i].Destroy.Errors.length > 0) {
                handleStoreDestroyErrors(store, data[i].Destroy.Errors);
            }
        }
    }
    
    function handleStoreDataErrors(store, data) {
        for (var i = 0; i < data.length; i++) {
            // for each error item: 
            //      - find the record based on the internalId
            //      - set syncstate
            //      - set syncmessage
            var record = getRecordWithInternalId(data[i].InternalId, store.getModifiedRecords());
            
            if (record != undefined) {
                record.set('SyncState', 'SyncError');          // Change icon
                record.set('SyncErrorMessage', data[i].Message);  // Was used by tooltip to show general errors - now use data-errorqtip on Status icon cell   
            }
        }
    }
    
    function handleStoreDestroyErrors(store, data) {
        for (var i = 0; i < data.length; i++) {
            alert(data[i].Message);
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
                updates[i].set('SyncState', 'Synced');
                updates[i].set('SyncErrorMessage', '');
                updates[i].commit();
            }
        }
    }

    function handleStoreCreates(store, results) {
        // for each added record, find it in the results object (using internalId)
        // and update the ID of the record with the new ID from the server/DB
        var added = store.getNewRecords();
        for (var i = 0; i < added.length; i++) {
            var record = getRecordWithInternalId(added[i].internalId, results.Actions);
            if (record != undefined) {
                added[i].set('ID', record.ID);
                added[i].set('SyncState', 'Synced');
                added[i].set('SyncErrorMessage', '');
                added[i].commit();
            }
        }
    }
    
    function getRecordWithInternalId(internalId, list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].InternalId === internalId || list[i].internalId === internalId) {
                if (list[i].Data)
                    return list[i].Data;
                return list[i];
            }
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

            Ext.each(deletions, function(rec, index) {
                rec.set('SyncState', 'Syncing');
            });
            Ext.each(additions, function(rec, index) {
                rec.set('SyncState', 'Syncing');
            });
            Ext.each(updates, function(rec, index) {
                rec.set('SyncState', 'Syncing');
            });

            if (deletions.length > 0 || additions.length > 0 || updates.length > 0) {
                results.push({
                    Store: s.storeId,
                    Create: { Actions: createTuple(additions) },
                    Update: { Actions: createTuple(updates) },
                    Destroy: { Actions: createTuple(deletions) },
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