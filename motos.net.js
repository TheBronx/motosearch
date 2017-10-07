var request = require('request'),
    cheerio = require('cheerio'),
    Moto = require('./Moto');

var site = 'motos.net';

var options = {
    url: 'http://motos.coches.net/ocasion/bmw/f_800_gt/?pg={page}&Version=f%20800%20gt&fi=SortDate',
    headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:41.0) Gecko/20100101 Firefox/41.0',
        'Accept': '*/*',
        'Accept-Language':'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Referer': 'http://motos.coches.net/ocasion/bmw/f_800_gt/'
    }
};

function retrieveAds(callback) {
    retrieveAdsAllPages(1, null, callback);
}

function retrieveAdsAllPages(page, allData, callback) {
    retrieveAdsPage(page, function(error, data) {
        if (error) {
            if (allData) return callback(null, allData);
            else return callback(error);
        }

        if (allData) {
            allData.ads = allData.ads.concat(data.ads);
        } else {
            allData = data;
        }

        retrieveAdsAllPages(page + 1, allData, callback);
    });
}

function requestParams(page) {
    return {
        url: options.url.replace('{page}', page),
        headers: options.headers
    };
}

function retrieveAdsPage(page, callback) {
    var ads = [];
    request(requestParams(page), function(err, resp, body) {
        if (err) {
            return callback(null, {
                'site': site,
                'error': true,
                'ads': ads
            });
        }

        $ = cheerio.load(body);

        $('#rows .lnkad').each(function() {
            var title = $(this).find('h2').text().trim();
            var price = $(this).find('.preu').text().trim();
            var date = $(this).find('p.data').text().trim();
            var link = $(this).attr('href').trim();
            var adIdAndSomeShit = $(this).parent().find('.contact-ad').data('t');
            var adId = adIdAndSomeShit.split('|')[0];
            var km = $(this).find('.dades .d1').text().trim().replace(' km', '');
            var year = $(this).find('.dades .d2').text().trim();

            var moto = new Moto({
                'site': site,
                'title': title,
                'price': price,
                'link': 'http://motos.coches.net' + link,
                'id': adId,
                'date': date,
                'km': km,
                'year': year
            });
            ads.push(moto);
        });

        if (ads.length == 0) return callback(new Error('No ads'));
        else {
            callback(null, {
                'site': site,
                'error': false,
                'ads': ads
            });
        }
    });
}

module.exports = {
    retrieveAds: retrieveAds
};
