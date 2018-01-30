const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const { dbURL }             = require('./config');
const app            = express();

const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(dbURL, (err, database) => {
  if (err) return console.error(err);
  require('./app/routes')(app, database.db('pp-products'));

  app.listen(port, () => {
	  console.log(`Product API is up at port: ${port}`);
	});          
});
