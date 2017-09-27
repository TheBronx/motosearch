var request = require('request'),
		cheerio = require('cheerio'),
		Moto = require('./Moto'),
	iconv = require('iconv-lite');

var site = 'milanuncios';

var options = {
		url: 'http://www.milanuncios.com/motos-de-carretera/gt.htm?marca=BMW&ccd=800&cch=800',
		headers: {
				'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:41.0) Gecko/20100101 Firefox/41.0',
				'Accept': '*/*',
				'Accept-Language':'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
				'Referer': 'http://www.milanuncios.com/motos-de-carretera/gt.htm?marca=BMW&ccd=800&cch=800'
		},
		encoding: null //this way the body will be a Buffer, not a String, so we can decode it with iconv
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

				$ = cheerio.load(iconv.decode(body, 'iso-8859-1'));

				var error = $('.nohayanuncios').length > 0;
				if (error) console.log('Milanuncios returned 0 results :(');

				$('#cuerpo .aditem').each(function() {
						var title = $(this).find('a.aditem-detail-title').text().trim();
						var price = $(this).find('.x11 .aditem-price').text().trim();
						var date = $(this).find('.x6').text().trim();
						var link = $(this).find('a.aditem-detail-title').attr('href').trim();
						var adId = link.match(/-(\d+)\.htm/)[1];
						var km = $(this).find('.x11 .kms').text().trim().replace(' kms', '');

						var moto = new Moto({
								'site': site,
								'title': title,
								'price': price,
								'link': 'http://www.milanuncios.com/motos-de-carretera/' + link,
								'id': adId,
								'date': translateRelativeDate(date),
								'km': km
						});

			if (!isNaN(moto.price)) {
				ads.push(moto);
			}
				});

				callback(null, {
						'site': site,
						'error': error,
						'ads': ads
				});
		});
}

function translateRelativeDate(dateStr) {
	var d = new Date();
	var diffMs = 0;

	if (dateStr.indexOf(' minuto') != -1 || dateStr.indexOf(' minutos') != -1) {
		diffMs = parseInt(dateStr.replace(' minutos', '').replace(' minuto', ''), 10);
		diffMs = diffMs * 60 * 1000;
	}

	if (dateStr.indexOf(' hora') != -1 || dateStr.indexOf(' horas') != -1) {
		diffMs = parseInt(dateStr.replace(' horas', '').replace(' hora', ''), 10);
		diffMs = diffMs * 60 * 60 * 1000;
	}

	if (dateStr.indexOf(' día') != -1 || dateStr.indexOf(' días') != -1) {
		diffMs = parseInt(dateStr.replace(' días', '').replace(' día', ''), 10);
		diffMs = diffMs * 24 * 60 * 60 * 1000;
	}

	d.setTime(d.getTime() - diffMs);
	return d.getDate() + '/' + (d.getMonth()+1) + ' ' + d.getMinutes() + ':' + d.getSeconds();
}

module.exports = {
		retrieveAds: retrieveAds
};
