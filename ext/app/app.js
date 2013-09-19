//Ext.Loader.loadScript(_EXTROOT + '/transactions/app/module/CashBalanceChartExt.js');

Ext.application({
    name: 'Transactions',
    appFolder: _EXTROOT + '/app',

    controllers: ["Main"],

    launch: function () {
        Ext.create('Ext.container.Container', {
            renderTo: 'main',
            layout: 'vbox',
            items: [
                {
                    xtype: 'panel',
                    width: 960,
                    layout: {
                        type: 'hbox',
                        align: 'left'
                    },
                    items: [{
                        dock: 'top',
                        xtype: 'toolbar',
                        items: [{
                                itemId: 'globalcancel',
                                text: 'Cancel',
                                disabled: true,
                                handler: function() {
                                    BatchProxyHandler.rejectChanges();
                                },
                                initComponent: function() {
                                    BatchProxyHandler.cancelButton = this;
                                }
                            }, {
                                itemId: 'globalsave',
                                text: 'Save',
                                disabled: true,
                                handler: function() {
                                    BatchProxyHandler.sync();
                                },
                                initComponent: function () {
                                    BatchProxyHandler.saveButton = this;
                                }
                            }]
                    }]
                },
                {
                    xtype: 'container',
                    width: 960,
                    layout: 'hbox',
                    items: [{
                            xtype: 'sportgrid',
                            width: 300,
                            height: 300
                        }, {
                            xtype: 'splitter',
                            width: 20,
                            vertical: true
                        }, {
                            xtype: 'drinkgrid',
                            width: 620,
                            height: 300
                        }
                    ]
                }]
        });

        Transactions.app = this; // Allow global access to this app instance, and controller e.g.: Transactions.app.controllers.items[0]
    }
});
