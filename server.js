var config = require('./config.json'),
    savedAds = require('./ads.json');

var async = require('async'),
    fs = require('fs'),
    nodemailer = require('nodemailer');
var mailer = nodemailer.createTransport();

var Moto = require('./Moto');
var segundamano = require('./segundamano');
var motosnet = require('./motos.net');
var milanuncios = require('./milanuncios');

async.series([
        segundamano.retrieveAds,
        motosnet.retrieveAds,
        milanuncios.retrieveAds
    ], function(err, results) {
        if (err) return console.log(err);

        var ads = getAdsFromResults(results);

        sendNotifications(ads);
        saveFiles(ads);
});

function getAdsFromResults(results) {
    var ads = [];
    for (var i=0; i<results.length; i++) {
        if (results[i].error) {
            //sometimes Milanuncios returns no results (error). If that happens, I don't want to save 0 results
            //cause later when the search starts working again, I'm going to notify about 'new ads' that are not new
            //So, lets just save the same results that we got the last time, instead of 0.
            var previousAds = getPreviousAdsForSite(results[i].site);
            ads = ads.concat(previousAds);
        } else {
            for (var j=0; j<results[i].ads.length; j++) {
                var ad = results[i].ads[j];
                ads.push(ad);
            }
        }
    }
    return ads;
}

function getPreviousAdsForSite(site) {
    var previousAds = [];
    for (var adId in savedAds) {
        if (adId.indexOf(site) != -1) {
            //we only have ID and PRICE of the AD, so we can't create a real Moto but it will be enough
            var moto = new Moto({});
            moto.site = site;
            moto.id = adId;
            moto.price = savedAds[adId];

            previousAds.push(moto);
        }
    }
    return previousAds;
}

function sendNotifications(ads) {
    for (var i=0; i<ads.length; i++) {
        var ad = ads[i];

        if (!savedAds[ad.id]) {
            notifyNewAd(ad);
        } else if (savedAds[ad.id] != ad.price) {
            notifyPriceChange(ad, savedAds[ad.id]);
        }
    }
}

function notifyNewAd(newad) {
    console.log('ad ' + newad.id + ' is new!');
    if (config.mail.enabled) {
        mailer.sendMail({
            from: config.mail.from,
            to: config.mail.to,
            subject: 'Nueva moto anunciada',
            text: 'Nueva moto anunciada en ' + newad.site + '\n' +
              'Precio: ' + newad.price + '€' + '\n' +
              'Km: ' + newad.km + '\n' +
              newad.link
        });
    }
}

function notifyPriceChange(ad, previousPrice) {
    console.log('ad ' + ad.id + ' has new price! ' + previousPrice + ' -> ' + ad.price);
    if (config.mail.enabled) {
        mailer.sendMail({
            from: config.mail.from,
            to: config.mail.to,
            subject: 'Cambio de precio',
            text: 'Una moto ha cambiado de precio en ' + ad.site + '\n' +
              'Precio: ' + ad.price + '€ (antes ' + previousPrice + '€)' + '\n' +
              'Km: ' + ad.km + '\n' +
              ad.link
        });
    }
}

function saveFiles(ads) {
    var controlFile = {};
    var toCVSFile = '';

    for (var i=0; i<ads.length; i++) {
        var ad = ads[i];
        controlFile[ad.id] = ad.price;
        toCVSFile += ad.toString() + '\n';
    }

    fs.writeFileSync(__dirname + '/ads.json', JSON.stringify(controlFile), 'utf8');
    var date = new Date();
    var dateStr = date.getDate() + '-' + (date.getMonth()+1) + ' ' +
                  date.getHours() + ':' + date.getMinutes();
    fs.writeFileSync(__dirname + '/snapshots/snapshot-' + dateStr + '.csv', toCVSFile, 'utf8');
}
