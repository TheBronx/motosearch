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
      addBikesToHistoric(historic, bikes, file);
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
      addBikesToHistoricByYear(historicByYear, bikes, file);
    } catch(err) {
      //old format snapshot probably, ignore bike
      //console.log(err);
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

function snapshotDateFromFile(file) {
  var fileDate = file.replace('snapshot-', '').replace(/\s.+/, '');
  var parts = fileDate.split('-');
  var date = new Date();
  //OLD FORMAT (2017 - 2018)
  //format without year: 15-12
  if (parts.length == 2) {
    date.setDate(parseInt(parts[0], 10));
    var month = parseInt(parts[1], 10);
    date.setMonth(month - 1);
    if (month > 6) { // last half of the year = 2017. first half is 2018 more or less
      date.setYear(2017);
    } else {
      date.setYear(2018);
    }
  // NEW FORMAT (since March 2018)
  //format with year: 15-12-2017
  } else {
    date.setDate(parseInt(parts[0], 10));
    date.setMonth(parseInt(parts[1], 10) - 1);
    date.setYear(parseInt(parts[2], 10));
  }

  return date;
}

function addBikesToHistoric(historic, bikes, file) {
  var snapshotDate = snapshotDateFromFile(file);
  bikes.forEach(bike => {
    if (!historic[bike.id]) {
      historic[bike.id] = {
        bike: {year: bike.year, km: bike.km},
        prices: []
      };
    }

    historic[bike.id].prices.push({date: snapshotDate, price: bike.price});
    historic[bike.id].prices = _.sortBy(historic[bike.id].prices, priceAndDate => {
      return priceAndDate.date.getTime();
    });
  });
}

function addBikesToHistoricByYear(historic, bikes, file) {
  var snapshotDate = snapshotDateFromFile(file);
  bikes.forEach(bike => {
    if (!historic[bike.year]) {
      historic[bike.year] = {
        prices: {}
      };
    }

    //var day = bike.date.getFullYear() + '-' + (bike.date.getMonth()+1) + '-' + bike.date.getDate();
    // we dont want to use the bike date (when it was published), what we want is to group by snapshot date to see the evolution over time
    var day = snapshotDate.getFullYear() + '-' + (snapshotDate.getMonth()+1) + '-' + snapshotDate.getDate();
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
