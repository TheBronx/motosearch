'use strict';

module.exports = function (options) {
    this.site = options.site || '';
    this.title = options.title || '';
    this.price = parsePrice(options.price || '');
    this.link = options.link || '';
    this.date = parseDate(options.date || '');
    this.id = this.site + '-' + (options.id || '');
    this.km = parseKm(options.km || '');
    this.year = options.year || '';

    this.toString = function() {
        return this.id + ',' + this.price + ',' + this.year + ',' + this.km + ',' + this.date + ',' + this.title.replace(/,/gi, '') + ',' + this.link;
    };

    return this;
};

function parsePrice(price) {
    return parseInt(price.replace(/[\.b]/gi, ''), 10);
}

function parseKm(km) {
    if (!km || km == '-' || km == 'N/D') return 0;
    return parseInt(km.replace(/[\.b]/gi, ''), 10);
}

function parseDate(strDate) {
    if (strDate.toLowerCase() == 'ahora') {
        return new Date();
    }

    var today = new Date();
    var yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    strDate = strDate.replace(/hoy/gi, today.getDate() + '/' + (today.getMonth()+1));
    strDate = strDate.replace(/ayer/gi, yesterday.getDate() + '/' + (yesterday.getMonth()+1));
    strDate = strDate.replace(' ene', '/01');
    strDate = strDate.replace(' feb', '/02');
    strDate = strDate.replace(' mar', '/03');
    strDate = strDate.replace(' abr', '/04');
    strDate = strDate.replace(' may', '/05');
    strDate = strDate.replace(' jun', '/06');
    strDate = strDate.replace(' jul', '/07');
    strDate = strDate.replace(' ago', '/08');
    strDate = strDate.replace(' sep', '/09');
    strDate = strDate.replace(' oct', '/10');
    strDate = strDate.replace(' nov', '/11');
    strDate = strDate.replace(' dic', '/12');

    try {
        var parsedDate = parseNormalizedDate(strDate);
    } catch (err) {
        console.log('Error parsing date: ' + strDate + ": " + err);
        parsedDate = 'Invalid Date';
    }
    return parsedDate;
}

function parseNormalizedDate(strDate) {
    var dateAndHour = strDate.split(' ');

    var dayAndMonth = dateAndHour[0].split('/');
    var day = dayAndMonth[0];
    var month = dayAndMonth[1];

	if (dateAndHour.length==1) dateAndHour.push("00:00"); //in case the date does not contain hour:minute

	var hoursAndMinutes = dateAndHour[1].split(':');
	var hours = hoursAndMinutes[0];
	var minutes = hoursAndMinutes[1];

    var date = new Date();
    date.setDate(day);
    date.setMonth(month - 1);
    date.setHours(hours);
    date.setMinutes(minutes);

    return date;
}
