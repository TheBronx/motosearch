var request = require('request'),
    cheerio = require('cheerio'),
    Moto = require('./Moto');

var site = 'motos.net';

var options = {
    url: 'http://motos.coches.net/ocasion/bmw/f_800_gt/',
    headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:41.0) Gecko/20100101 Firefox/41.0',
        'Accept': '*/*',
        'Accept-Language':'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Referer': 'http://motos.coches.net/ocasion/bmw/f_800_gt/'
    }
};

function retrieveAds(callback) {
    var ads = [];
    request(options, function(err, resp, body) {
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
            
            var moto = new Moto({
                'site': site,
                'title': title,
                'price': price,
                'link': 'http://motos.coches.net' + link,
                'id': adId,
                'date': date
            });
            ads.push(moto);
        });

        callback(null, {
            'site': site,
            'error': false,
            'ads': ads
        });
    });
}

module.exports = {
    retrieveAds: retrieveAds
};