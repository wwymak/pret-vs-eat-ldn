/**
 * Query to goolge places api for locations of Pret/EAT in London
 * This is slightly arbitrary definition of central london:
 * Lat from 51.481157 t0 51.531074
 * Lng from -0.219215 to -0.069970
 *
 * Using info from http://www.movable-type.co.uk/scripts/latlong.html
 * 0.006 lng and 0.004 lat roughly define a square of 0.4km
 *
 * from google, want the geometry, place_id, name
 */

var googleCred = require('./config/googleMapsConf');
var apiKey = googleCred.credentials.apiKey;
var request = require('request');
var pmongo = require('promised-mongo');
var database = require('./config/database');
var db = pmongo(database.dburl);
var pretColl = db.collection('pret');
var eatColl = db.collection('eat');

var baseURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${apiKey}`;
var count = 0;

function queryPlaces(latLng, radius, restaurantName, collection, callback ){
  var queryURL = `${baseURL}&location=${latLng}&radius=${radius}&name=${restaurantName}`;
  request(queryURL, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      var data =  JSON.parse(body);
      console.log(data.status);
      if(data.status == "OK"){
        data.results.forEach((d, i) => {
          var geo = d['geometry']['location'],
              placeID = d['place_id'],
              placeName = d['name'];

          var doc = {geo, _id: placeID, placeName};

          collection.insert(doc).then(() => {
            if (callback) callback()
          });
        })

      }else{ //ZERO_RESULTS
        if(callback) callback()
      }

        //collection.findOneAndUpdate({'placeID': placeID},
        //    {$set: {geo, placeID, placeName}},
        //    {upsert: true}).then(() =>{
        //    if(callback) callback()

    }else {
      if(callback) callback();
    }
  })
}

var latSpan = 51.531074 - 51.481157,
    lngSpan = -0.069970 + 0.219215,
    latPoints = Math.floor(latSpan/0.004),
    lngPoints = Math.floor(lngSpan/0.006);

var latSpanArr = new Array(latPoints).fill(51.481157)
        .map((d,i) => (d + i * 0.004).toFixed(6)),
    lngSpanArr = new Array(lngPoints).fill(-0.219215)
        .map((d,i) => (d + i * 0.006).toFixed(6));

function getLatLngPairs(latSpanArr, lngSpanArr){
  var out = [];
  latSpanArr.forEach((d,i) => {
    lngSpanArr.forEach((e,i) => {
      out.push(`${d},${e}`);
    })
  });
  return out
}

var allLatLngs = getLatLngPairs(latSpanArr, lngSpanArr);
console.log(allLatLngs[0]);
allLatLngs.forEach((d, i) => queryPlaces(d, 500, "PRET A Manger", pretColl, () => {
  count ++;
  if(count == allLatLngs.length){
    console.log('done')
  }
}));

//queryPlaces("51.503186,-0.126446", 500, "EAT", eatColl)