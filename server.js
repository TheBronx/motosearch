var async = require('async'),
    fs = require('fs');

var segundamano = require('./segundamano');
var motosnet = require('./motos.net');

var savedAds = require('./ads.json');

async.series([
        segundamano.retrieveAds,
        motosnet.retrieveAds
    ], function(err, results) {
        var ads = getAdsFromResults(results);
        
        sendNotifications(ads);
        saveFiles(ads);
});

function getAdsFromResults(results) {
    var ads = [];
    for (var i=0; i<results.length; i++) {
        for (var j=0; j<results[i].length; j++) {
            var ad = results[i][j];
            ads.push(ad);
        }
    }
    return ads;
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
}

function notifyPriceChange(ad, previousPrice) {
    console.log('ad ' + ad.id + ' has new price! ' + previousPrice + ' -> ' + ad.price);
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
    var dateStr = date.getDate() + '-' + (date.getMonth()+1) + ' ' 
                + date.getHours() + ':' + date.getMinutes();
    fs.writeFileSync(__dirname + '/snapshots/snapshot-' + dateStr + '.csv', toCVSFile, 'utf8');
}