'use strict';

let Router = require('osprey').Router;
var router = new Router();
import fetcher from './fetcher';

router.get('/', function(req, res) {
  fetcher.get('/users/me').then(res => {
    res.json(res.data);
  }).catch(err => {
    res.status(401).end();
  });
});

router.post('/', function(req, res) {
  fetcher.post('/login', req.body).then(response => {
    res.json(response.data).end();
  }, (err) => {
    res.status(400).end();
  });
});

module.exports = router;
