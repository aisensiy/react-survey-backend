var Router = require('osprey').Router;
import fetcher from './fetcher';
var router = new Router();
var _ = require('lodash');

function auth(req, res, next) {
  if (!req.headers.authentication) {
    res.status(401).end();
  }
  fetcher.get('/users/me', {
    headers: {
      'X-LC-Session': req.headers.authentication
    }
  }).then((response) => {
    req.currentUser = response.data;
    next();
  }).catch(err => {
    res.status(401).json(err.response.data);
  });
}

router.post('/', function (req, res) {
  let userParams = req.body;
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
    res.status(err.statusCode ? err.statusCode : 500).json(err);
  });
});

router.post('/{userId}/surveys', {userId: {type: 'string'}}, auth, (req, res) => {
  if (req.params.userId !== req.currentUser.objectId) {
    res.status(403).json({
      message: 'No authorization to create survey'
    });
    return;
  }
  var newSurvey = req.body;
  newSurvey.author = {
    __type: 'Pointer',
    className: '_User',
    objectId: req.currentUser.objectId
  };

  fetcher.post('/classes/Survey', newSurvey).then(response => {
    res.status(201).json(response.data);
  }).catch(err => {
    res.status(400).json(err.response.data);
  });
});

router.get('/{userId}/surveys', {userId: {type: 'string'}}, auth, (req, res) => {
  if (req.params.userId !== req.currentUser.objectId) {
    res.status(403).json({
      message: 'No authorization to view other\'s surveys'
    });
  }

  fetcher.get('/classes/Survey', {
    params: {
      where: {
        author: {
          __type: 'Pointer',
          className: '_User',
          objectId: req.currentUser.objectId
        }
      }
    }
  }).then(response => {
    res.status(201).json(response.data.results);
  }).catch(err => {
    res.status(500).json(err.response.data);
  });
});

module.exports = router;
