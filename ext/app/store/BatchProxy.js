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
        store.addListener('rejected', me.checkStoreStatus);
    }
    
    me.checkStoreStatus = function (g, eOpts) {
        if (me.cancelButton === undefined || me.saveButton === undefined)
            return;
        
        if (g.getModifiedRecords().length > 0 || g.getRemovedRecords().length > 0) {
            me.cancelButton.setDisabled(false);
            me.saveButton.setDisabled(false);
        } else {
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
        var obj = Ext.decode(response.responseText);
        console.dir(obj);
    }
    
    function getStoreSyncData() {
        var results = [];
        for (var i = 0; i < me.stores.length; i++) {
            var s = me.stores[i];

            var deletions = s.getRemovedRecords();
            var additions = s.getNewRecords();
            var updates = s.getModifiedRecords();

            if (deletions.length > 0 || additions.length > 0 || updates.length > 0) {
                results.push({
                    store: s.storeId,
                    create: createTuple(additions, true, false),
                    update: createTuple(updates, true, true),
                    destroy: createTuple(deletions, false, null),
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
            if (filterIndex) {
                if (hasIndex == (records[i].index != undefined)) {
                    result.push({ internalId: records[i].internalId, data: records[i].data });
                }
            } else {
                result.push({ internalId: records[i].internalId, data: records[i].data });
            }
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