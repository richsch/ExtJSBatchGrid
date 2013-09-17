function SAMoney(v) {
    /*if (typeof v === 'undefined')
        return '';*/
    if (v == null)
        return '';
    else if (isNaN(v))
        return '';
    else
        return Ext.util.Format.currency(v, 'R', 2);
}

function SAMoneyRandOnly(v) {
    /*if (typeof v === 'undefined')
    return '';*/
    if (v == null)
        return '';
    else if (isNaN(v))
        return '';
    else
        return Ext.util.Format.currency(v, 'R', -1);    // ICNOTE - 0 defaults to UtilFormat.currencyPrecision = 2
}

function SAMoneyRandOnlyNoZeros(v) {
    /*if (typeof v === 'undefined')
    return '';*/
    if (v == null)
        return '';
    else if (isNaN(v))
        return '';
    else {
        if (v === 0) {
            return '';
        }
        return Ext.util.Format.currency(v, 'R', -1);    // ICNOTE - 0 defaults to UtilFormat.currencyPrecision = 2
    }
}

function SAMoneyConcise(v) {
    /*if (typeof v === 'undefined')
    return '';*/
    if (v == null)
        return '';
    else if (isNaN(v))
        return '';

    return Ext.util.Format.number(Math.round(v),',0');
}

function FormatDate(value) {
    return value ? Ext.Date.dateFormat(value, 'Y-m-d') : '';
}

function Percentage(v) {
    return v + '%';
}

function Bold(v) {
    return '<span style="font-weight:bold;">' + v + '</span>';
}

function BoldSAMoney(v) {
    return '<span style="font-weight:bold;">' + SAMoney(v) + '</span>';
}

function BoldPercentage(v) {
    return '<span style="font-weight:bold;">' + Percentage(v) + '</span>';
}

function Summary_Sum_IgnoreNaNs(records, col) {
    var sum = 0;
    for (var i = 0; i < records.length; i++) {
        var v = records[i].get(col);
        if ((typeof v === 'undefined') || (v == null) || isNaN(v))
            continue;
        sum += v;
    }
    return sum;
}

function GreenRedSAMoney(v) {
    if (v == null) {
        return v;
    }

    if (v == 0) {
        return SAMoney(v);
    } else if (v > 0) {
        return '<span style="color:green;">' + SAMoney(v) + '</span>';
    } else {
        return '<span style="color:red;">' + SAMoney(v) + '</span>';
    }
}

function GreenRedNumber(v) {
    if (v == null) {
        return v;
    }

    if (v == 0) {
        return '0';
    } else if (v > 0) {
        return '<span style="color:green;">' + NRCommon.Round(v, 2) + '</span>';
    } else {
        return '<span style="color:red;">' + NRCommon.Round(v, 2) + '</span>';
    }
}

function GreenRedPercent(v) {
    if (v == null) {
        return v;
    }

    if (v == 0) {
        return '0%';
    } else if (v > 0) {
        return '<span style="color:green;">' + NRCommon.Round(v * 100, 2) + '%</span>';
    } else {
        return '<span style="color:red;">' + NRCommon.Round(v * 100, 2) + '%</span>';
    }
}

function CorporateActionType(v) {
    switch (v) {
        case 0:
            return 'Dividend';
        default:
            return 'Unknown';
    }
}