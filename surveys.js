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

router.get('/{surveyId}', {surveyId: {type: 'string'}}, function (req, res) {
  fetcher.get('/classes/Survey/' + req.params.surveyId, {
    params: {
      include: 'author'
    }
  }).then(response => res.json(response.data));
});

router.put('/{surveyId}', {surveyId: {type: 'string'}}, auth, (req, res) => {
  var surveyParams = _.pick(req.body, ['title', 'subTitle', 'questions', 'receiveResults', 'publishResults']);

  fetcher.put('/classes/Survey/' + req.params.surveyId, surveyParams).then(response => {
    res.status(200).json(response.data);
  }).catch(err => {
    res.status(400).json(err.response.data);
  });
});

router.get('/{surveyId}/results', {surveyId: {type: 'string'}}, function(req, res) {
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
});

router.post('/{surveyId}/results', {surveyId: {type: 'string'}}, function(req, res) {
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
});

module.exports = router;
