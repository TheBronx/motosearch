'use strict';

var fs = require('fs');
var _ = require('underscore');

obtainAllSnapshots((err, snapshots) => {
  var historic = convertSnapshotsToHistoric(snapshots);
  var historicByYear = convertSnapshotsToHistoricByYear(snapshots);

  saveToFile(historic, 'historic/historic.json');
  saveToFile(historicByYear, 'historic/historic-year.json');
});

function obtainAllSnapshots(callback) {
  fs.readdir('./snapshots/', (err, files) => {
    if (err) return callback(err);

    var csvs = _.filter(files, file => file.indexOf('.csv') != -1);
    callback(null, csvs);
  });
}

function convertSnapshotsToHistoric(snapshots) {
  var historic = {};

  snapshots.forEach(file => {
    var content = fs.readFileSync('./snapshots/' + file, "utf8");
    try {
      var bikes = parseSnapshot(content);
      addBikesToHistoric(historic, bikes);
    } catch(err) {
      //old format snapshot probably, ignore bike
    }
  });

  return historic;
}

function convertSnapshotsToHistoricByYear(snapshots) {
  var historicByYear = {};

  snapshots.forEach(file => {
    var content = fs.readFileSync('./snapshots/' + file, "utf8");
    try {
      var bikes = parseSnapshot(content);
      addBikesToHistoricByYear(historicByYear, bikes);
    } catch(err) {
      //old format snapshot probably, ignore bike
    }
  });

  return historicByYear;
}

function parseSnapshot(csvContent) {
  var lines = csvContent.split('\n');
  lines = _.filter(lines, line => line != '');
  var bikes = _.map(lines, line => {
    var parts = line.split(',');
    var bike = {
      id: parts[0],
      price: parseInt(parts[1], 10),
      year: parseInt(parts[2], 10),
      km: parseInt(parts[3], 10),
      date: new Date(parts[4])
    };
    return bike;
  });
  return _.filter(bikes, bike => bike.id.indexOf('milanuncios') == -1           // exclude milanuncios
    && bike.id.indexOf('segundamano') == -1                                     // exclude segundamano (most ads are dupes of motos.net)
    && bike.date != null
    && !isNaN(bike.date.getTime())
    && bike.price > 5000 && bike.price < 15000                                  // exclude too low/high prices
    && bike.date.getTime() > (new Date('2017-10-01T00:00:00.000Z').getTime())   // since Oct 1 2017
  );
}

function addBikesToHistoric(historic, bikes) {
  bikes.forEach(bike => {
    if (!historic[bike.id]) {
      historic[bike.id] = {
        bike: {year: bike.year, km: bike.km},
        prices: []
      };
    }

    historic[bike.id].prices.push({date: bike.date, price: bike.price});
    historic[bike.id].prices = _.sortBy(historic[bike.id].prices, priceAndDate => {
      return priceAndDate.date.getTime();
    });
  });
}

function addBikesToHistoricByYear(historic, bikes) {
  bikes.forEach(bike => {
    if (!historic[bike.year]) {
      historic[bike.year] = {
        prices: {}
      };
    }

    var day = bike.date.getFullYear() + '-' + (bike.date.getMonth()+1) + '-' + bike.date.getDate();
    if (!historic[bike.year].prices[day]) {
      historic[bike.year].prices[day] = {
        price: bike.price,
        items: 1,
        averagePrice: bike.price
      };
    } else {
      historic[bike.year].prices[day] = {
        price: historic[bike.year].prices[day].price + bike.price,
        items: historic[bike.year].prices[day].items + 1
      };
      historic[bike.year].prices[day].averagePrice = historic[bike.year].prices[day].price/historic[bike.year].prices[day].items;
    }
  });
}

function saveToFile(historic, file) {
  fs.writeFileSync(file, JSON.stringify(historic));
}
