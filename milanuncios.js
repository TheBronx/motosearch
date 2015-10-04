var request = require('request'),
    cheerio = require('cheerio'),
    Moto = require('./Moto');

var options = {
    url: 'http://www.milanuncios.com/motos-de-carretera/gt.htm?marca=BMW&ccd=800&cch=800',
    headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:41.0) Gecko/20100101 Firefox/41.0',
        'Accept': '*/*',
        'Accept-Language':'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Referer': 'http://www.milanuncios.com/motos-de-carretera/gt.htm?marca=BMW&ccd=800&cch=800'
    }
}

function retrieveAds(callback) {
    var ads = [];
    request(options, function(err, resp, body) {
        if (err) {
            return callback(err);
        }
        
        $ = cheerio.load(body);
        
        $('.x1').each(function() {
            var title = $(this).find('a.cti').text().trim();
            var price = $(this).find('.x11 .pr').text().trim();
            var date = $(this).find('.x2 .x6').text().trim();
            var link = $(this).find('a.cti').attr('href').trim();
            var adId = link.match(/-(\d+)\.htm/)[1];
            
            var moto = new Moto({
                'site': 'milanuncios',
                'title': title,
                'price': price,
                'link': 'http://www.milanuncios.com/motos-de-carretera/' + link,
                'id': adId,
                'date': date
            });
            ads.push(moto);
        });
        
        callback(null, ads);
    });
}

module.exports = {
    retrieveAds: retrieveAds
};