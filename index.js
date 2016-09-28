var osprey = require('osprey');
var express = require('express');
var join = require('path').join;
var app = express();
var competences = require('./competences');
var groups = require('./groups');
var users = require('./users');
var authentication = require('./authentication');

var path = join(__dirname, 'Feedback.0.8.raml');

// Be careful, this uses all middleware functions by default. You might just
// want to use each one separately instead - `osprey.server`, etc.
osprey.loadFile(path)
    .then(function (middleware) {
      app.use(middleware);

      app.use('/authentication', authentication);
      app.use('/competences', competences);
      app.use('/groups', groups);
      app.use('/users', users);

      app.listen(3000)
    })
    .catch(function(e) { console.error("Error: %s", e.message); });
