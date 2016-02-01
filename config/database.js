/**
 * Created by wwymak on 31/01/2016.
 */

var dbUrl = 'mongodb://localhost/pret-vs-eat';
module.exports.dburl = process.env.MONGO_URL || dbUrl;