const app = require('express')();
const port = process.env.PORT || 3333;
const { MongoClient } = require('mongodb');

app.engine('handlebars', require('express-handlebars')());
app.set('view engine', 'handlebars');

MongoClient.connect(process.env.MONGO_URI, (err, client) => {
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

  app.get('/load', (req, res) => {
    const { from, to, type } = req.query;

    measures
      .find({
          $and: [
            { ts: { $gt: new Date(from) } },
            { ts: { $lt: new Date(to) } }
          ]
      })
      .project({
        [type]: 1,
        _id: 0,
        ts: 1
      })
      .toArray((err, measures) => {
        if (err) {
          console.error(err);
        } else {
          res.json(measures.map(item => [item.ts, item[type]]));
        }
      });
  });

  app.get('/', (req, res) => {
    measures.findOne({}, { sort: { ts: -1 } }, (err, lastMeasure) => {
      if (err) {
        console.error(err);
      } else {
        res.render('main', { lastMeasure });
      }
    });
  });

  app.listen(port, console.log);
});
