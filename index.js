const app = require('express')();
const port = 3333;
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;

console.log(uri);

MongoClient.connect(uri, (err, client) => {
  if (err) {
    console.error(err);
    return;
  }

  const measures = client.db('christmas-tree').collection('measures');

  app.get('/register', (req, res) => {
    const { temp, hum } = req.query;

    measures.insert({
      temp: parseFloat(temp),
      hum: parseFloat(hum),
      ts: new Date()
    }, err => {
      if (err) {
        console.error(err);
      } else {
        res.status(204).end();
      }
    });
  });

  app.get('/', (req, res) => {
    measures.findOne({}, { sort: { ts: -1 } }, (err, lastMeasure) => {
      if (err) {
        console.error(err);
      } else {
        res.json(lastMeasure);
      }
    });
  });

  app.listen(port, console.log);
});
