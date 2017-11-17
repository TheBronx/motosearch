'use strict';

var fs = require('fs');
var _ = require('underscore');

obtainAllSnapshots((err, snapshots) => {
  var historic = convertSnapshotsToHistoric(snapshots);
  saveHistoric(historic);
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
  return _.filter(bikes, bike => bike.id.indexOf('milanuncios') == -1
    && bike.date != null
    && !isNaN(bike.date.getTime())
    && bike.price < 15000                  // menos de 15.000€ para quitar aberraciones
    && bike.date.getTime() > 1500076800000 // a partir del 15 de julio de 2017
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

function saveHistoric(historic) {
  fs.writeFileSync('historic/historic.json', JSON.stringify(historic));
}
