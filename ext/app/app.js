//Ext.Loader.loadScript(_EXTROOT + '/transactions/app/module/CashBalanceChartExt.js');

Ext.application({
    name: 'Transactions',
    appFolder: _EXTROOT + '/app',

    controllers: ["Main"],

    launch: function () {
        Ext.create('Ext.container.Container', {
            renderTo: 'main',
            layout: 'vbox',
            items: [{
                xtype: 'container',
                width: 960,
                layout: 'hbox',
                items: [{
                    xtype: 'cashgrid',
                    width: 300,
                    height: 300
                }, {
                    xtype: 'splitter',
                    width: 20,
                    vertical: true
                }, {
                    xtype: 'tradegrid',
                    width: 620,
                    height: 300
                }]
            }]
        });

        Transactions.app = this; // Allow global access to this app instance, and controller e.g.: Transactions.app.controllers.items[0]
    }
});
