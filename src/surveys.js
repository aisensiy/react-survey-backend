var Router = require('osprey').Router;
import fetcher from './fetcher';
var router = new Router();
var _ = require('lodash');

function auth(req, res, next) {
  if (!req.headers.authentication) {
    next();
    return;
  }

  fetcher.get('/users/me', {
    headers: {
      'X-LC-Session': req.headers.authentication
    }
  }).then((response) => {
    req.currentUser = response.data;
    next();
  }).catch(err => {
    next();
  });
}

router.get('/{surveyId}', {surveyId: {type: 'string'}}, function (req, res) {
  fetcher.get('/classes/Survey/' + req.params.surveyId, {
    params: {
      include: 'author'
    }
  }).then(response => res.json(response.data));
});

router.put('/{surveyId}', {surveyId: {type: 'string'}}, auth, (req, res) => {
  fetcher.get('/classes/Survey/' + req.params.surveyId).then(response => {
    let survey = response.data;
    if (!req.currentUser || req.currentUser.objectId !== survey.author.objectId) {
      return Promise.reject({
        statusCode: 403,
        message: 'No right to update other\'s survey'
      });
    } else {
      return Promise.resolve({});
    }
  }).then(() => {
    var surveyParams = _.pick(req.body, ['title', 'subTitle', 'questions', 'receiveResults', 'publishResults']);
    return fetcher.put('/classes/Survey/' + req.params.surveyId, surveyParams);
  }).then(() => {
    res.status(204).end();
  }).catch(err => {
    res.status(err.statusCode ? err.statusCode : 400).json(err.statusCode ? err : err.response.data);
  });
});

function notAuthor(currentUser, survey) {
  return !currentUser || currentUser.objectId !== survey.author.objectId;
}

router.get('/{surveyId}/results', {surveyId: {type: 'string'}}, auth, function(req, res) {
  fetcher.get('/classes/Survey/' + req.params.surveyId).then(response => {
    let survey = response.data;
    if (!survey.publishResults && notAuthor(req.currentUser, survey)) {
      return Promise.reject({
        statusCode: 400,
        message: 'Do not receive result any more'
      });
    } else {
      return Promise.resolve({});
    }
  }).then(() => {
    fetcher.get('/classes/Result', {
      params: {
        where: {
          survey: {
            __type: 'Pointer',
            className: 'Survey',
            objectId: req.params.surveyId
          }
        }
      }
    }).then(response => {
      res.json(response.data.results);
    }).catch(err => {
      res.status(500).json(err.response.data);
    });
  }).catch(err => {
    res.status(err.statusCode ? err.statusCode : 500).json(err.statusCode ? err : err.response.data);
  });
});

router.post('/{surveyId}/results', {surveyId: {type: 'string'}}, auth, function(req, res) {
  fetcher.get('/classes/Survey/' + req.params.surveyId).then(response => {
    let survey = response.data;
    if (!survey.receiveResults && notAuthor(req.currentUser, survey)) {
      return Promise.reject({
        statusCode: 400,
        message: 'Do not receive result any more'
      });
    } else {
      return Promise.resolve({});
    }
  }).then(() => {
    fetcher.post('/classes/Result', {
      result: req.body,
      survey: {
        __type: 'Pointer',
        className: 'Survey',
        objectId: req.params.surveyId
      }
    }).then(response => {
      res.status(201).json(response.data);
    }).catch(err => {
      res.status(500).json(err.response.data);
    });
  }).catch(err => {
    res.status(err.statusCode ? err.statusCode : 500).json(err.statusCode ? err : err.response.data);
  });
});

module.exports = router;
