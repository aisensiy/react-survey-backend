var Router = require('osprey').Router;
import fetcher from './fetcher';
var router = new Router();
var _ = require('lodash');

router.post('/', function (req, res) {
  let userParams = req.body;
  console.log(userParams);
  fetcher.get('/users', {
    params: {
      where: {
        username: userParams.username
      }
    }
  }).then(response => {
    if (response.data.results.length === 0) {
      return fetcher.post('/users', userParams).then(response => response.data).catch(err => {
        return Promise.reject({
          statusCode: 400,
          message: err.response.data
        });
      });
    } else {
      return Promise.reject({
        statusCode: 400,
        message: `User ${userParams.username} already exists`
      });
    }
  }).then(response => {
    res.status(201).json(response.data);
  }).catch(err => {
    console.log(err);
    res.status(err.statusCode ? err.statusCode : 500).json(err);
  });
});

module.exports = router;
