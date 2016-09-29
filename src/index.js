var osprey = require('osprey');
var express = require('express');
var join = require('path').join;
var app = express();
var users = require('./users');
var surveys = require('./surveys');
var authentication = require('./authentication');
var cors = require('express-cors');

var path = join(__dirname, '../raml/survey.raml');

// Be careful, this uses all middleware functions by default. You might just
// want to use each one separately instead - `osprey.server`, etc.
osprey.loadFile(path)
    .then(function (middleware) {
      app.use(cors({
        allowedOrigins: (process.env.ORIGINS || '*').split(','),
        headers: ['Authentication', 'X-LC-Session', 'Content-Type']
      }));

      app.use(middleware);

      app.use('/authentication', authentication);
      app.use('/users', users);
      app.use('/surveys', surveys);

      app.listen(process.env.PORT || 5000)
    })
    .catch(function(e) { console.error("Error: %s", e.message); });
