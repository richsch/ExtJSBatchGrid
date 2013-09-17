Ext.define('Transactions.controller.Main', {
    extend: 'Ext.app.Controller',
    requires: ['Transactions.module.TransactionComms'],

    models: ['InstrumentModel', 'CashModel', 'TradeModel'],
    stores: ['Transactions.store.InstrumentStore', 'Transactions.store.CashStore', 'Transactions.store.TradeStore'],
    views: ['CashGrid', 'TradeGrid'],

    refs: [{
        ref: 'cashGrid',
        selector: 'cashgrid'
    }, {
        ref: 'tradeGrid',
        selector: 'tradegrid'
    /*}, {
        ref: 'secondRow',
        selector: '#SecondRow'
    }, {
        ref: 'thirdRow',
        selector: '#ThirdRow'*/
    }],

    onLaunch: function (app) {
        CashGridExt.init(this.getCashGrid(), this);
        TradeGridExt.init(this.getTradeGrid(), this);
    }
});
