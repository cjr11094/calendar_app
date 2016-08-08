var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var EVENTS_FILE = path.join(__dirname, 'events.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/events', function(req, res) {
  fs.readFile(EVENTS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/events', function(req, res) {
  fs.readFile(EVENTS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var events = JSON.parse(data);

    var newEvent = {
      id: Date.now(),
      title: req.body.title,
      description: req.body.description,
      date: req.body.date
    };

    events.push(newEvent);
    fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(events);
    });
  });
});

app.post('/api/events/:id', function(req, res) {
  fs.readFile(EVENTS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var events = JSON.parse(data);

    events.forEach(
      function(event){
        var id = parseInt(req.params.id);
        if(event.id === id){
          event.description = req.body.description;
        }
      }
    );

    fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(events);
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});