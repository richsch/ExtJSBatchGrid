Ext.define('Transactions.controller.Main', {
    extend: 'Ext.app.Controller',

    models: ['SportModel', 'DrinkModel'],
    stores: ['Transactions.store.SportStore', 'Transactions.store.DrinkStore'],
    views: ['DrinkGrid', 'SportGrid'],

    refs: [{
        ref: 'drinkGrid',
        selector: 'drinkgrid'
    }, {
        ref: 'sportGrid',
        selector: 'sportgrid'
    }],

    onLaunch: function (app) {
        SportGridExt.init(this.getSportGrid(), this);
        DrinkGridExt.init(this.getDrinkGrid(), this);
    }
});
