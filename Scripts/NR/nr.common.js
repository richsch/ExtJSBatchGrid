var NRCommon = (function () {
    var me = {};
    
    me.Round = function (number, digits) {
        var multiple = Math.pow(10, digits);
        var rndedNum = Math.round(number * multiple) / multiple;
        return rndedNum;
    };

    me.DebugLog = function (msg) {
        // Prevent IE from crashing on debugLog messages
        if (typeof console != "undefined" && typeof console.log != "undefined") {
            console.log(msg);
        }
    };

    return me;
}());