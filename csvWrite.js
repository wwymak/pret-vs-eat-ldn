/**
 * Created by wwymak on 02/02/2016.
 */
var fs = require('fs');
var csv = require("fast-csv");
var csvStream = csv.createWriteStream({headers: true}),
    writableStream = fs.createWriteStream("eat.csv");

writableStream.on("finish", function(){
  console.log("DONE!");
});
csvStream.pipe(writableStream);

var pmongo = require('promised-mongo');
var database = require('./config/database');
var db = pmongo(database.dburl);
var pretColl = db.collection('pret');
var eatColl = db.collection('eat');


eatColl.find().toArray().then(docs => {
  console.log(docs[0]);
  //var out = [docs[0]._id, docs[0].placeName, docs[0].geo.lat.toString(), docs[0].geo.lng.toString()]
  //console.log(out)
  //writer.pipe(fs.createWriteStream('pret.csv'));
  //writer.write(out);
  docs.forEach((doc, i) => {
    console.log(i)
    csvStream.write({"id": doc._id, "placeName": doc.placeName,
      lat: doc.geo.lat, lng: doc.geo.lng})
  });

  csvStream.end();

})