'use strict';

let Router = require('osprey').Router;
var router = new Router();
import fetcher from './fetcher';

router.get('/', function(req, res) {
  fetcher.get('/users/me', {
    headers: {
      'X-LC-Session': req.headers.authentication
    }
  }).then(response => {
    res.json(response.data);
  }).catch(err => {
    res.status(401).json(err.response.data);
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
