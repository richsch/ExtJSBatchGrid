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

    me.sync = function() {
        
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