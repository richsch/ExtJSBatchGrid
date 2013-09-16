/*
Notes on dates:

1. Dates automatically adjust for current timezone when new date object created
    var d = new Date('2012-01-01');     // Assumes 2012-01-01T00:00 in UTC, will add current TimeZone offset - e.g. UCT + 2 for SA
    d
    Sun Jan 03 2012 02:00:00 GMT+0200 (South Africa Standard Time)

2. Assignment doesn't copy
    var d = new Date('2012-01-01');
    var e = d;      // NOTE - d and e point to same date object
    e.setDate(3);   // NOTE - both d and e changed
    e
    Tue Jan 03 2012 02:00:00 GMT+0200 (South Africa Standard Time)
    d
    Tue Jan 03 2012 02:00:00 GMT+0200 (South Africa Standard Time)

3. Clone date objects like so:
    var orig = new Date('2012-01-01');
    var clone = new Date(orig.getTime());

    // Proof .clone() prototype works
    var d = new Date('2012-02-02'); // Thu Feb 02 2012 02:00:00 GMT+0200 (South Africa Standard Time)
    var e = d.clone();  // Thu Feb 02 2012 02:00:00 GMT+0200 (South Africa Standard Time)
    e.setDate(10);

    e
    Fri Feb 10 2012 02:00:00 GMT+0200 (South Africa Standard Time)
    d
    Thu Feb 02 2012 02:00:00 GMT+0200 (South Africa Standard Time)

4. Add days
    // Must create date object with current date/time
    var d = new Date('2012-01-31')
    d
    Tue Jan 31 2012 02:00:00 GMT+0200 (South Africa Standard Time)

    // Then setDate - NOTE: will handle days > num days in month overflow correctly
    d.setDate(d.getDate()+2)
    d
    Thu Feb 02 2012 02:00:00 GMT+0200 (South Africa Standard Time)
*/

Date.prototype.toUTCArray = function () {
    var D = this;
    return [D.getUTCFullYear(), D.getUTCMonth(), D.getUTCDate(), D.getUTCHours(),
    D.getUTCMinutes(), D.getUTCSeconds()];
}

Date.prototype.toISO = function () {
    var tem, A = this.toUTCArray(), i = 0;
    A[1] += 1;
    while (i++ < 7) {
        tem = A[i];
        if (tem < 10) A[i] = '0' + tem;
    }
    return A.splice(0, 3).join('-') + 'T' + A.join(':');
}

Date.prototype.toUTCDateString = function () {
    var D = this;
    return D.getUTCFullYear() + '-' + D.getUTCMonth() + '-' + D.getUTCDate();
}

// NOTE: Dependency on ExtJS
Date.prototype.toUTCDateStringExt = function (fmt) {
    var D = this.clone();   // NOTE: Ensure this date is not modified by setMinutes() next
    D.setMinutes(D.getMinutes() + D.getTimezoneOffset());
    return Ext.Date.format(D, fmt);
}

Date.prototype.clone = function () {
    var D = this;
    return new Date(D.getTime());
}

Date.prototype.equals = function (D2) {
    var D1 = this;
    return D1.getTime() == D2.getTime();
}

Date.prototype.addMonths = function (months) {
    var D1 = this.clone();
    D1.setMonth(D1.getMonth() + months);
    return D1;
}
