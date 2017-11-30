const Streamify = require('streamify-string');
const discover  = require('../app/cmd-discover');
const includes  = require('lodash.includes');
const stream    = require('stream');
const test      = require('tape');


// mock the github object
const Github = function (options) {

  var github = {
    params : {},
    repos  : {},
  };

  // `authenticate` method
  github.authenticate = function (params) {
    github.params = params;
  };

  // `repos.getAll` method
  github.repos.getAll = function (params, cb) {
    const repos = {};
    repos.data  = [
      { ssh_url: 'git@github.com:johndoe/alpha.git' },
      { ssh_url: 'git@github.com:johndoe/bravo.git' },
      { ssh_url: 'git@github.com:johndoe/charlie.git' },
    ];
    cb(null, repos);
  };

  // return the github object
  return github;
};

test('cmd-discover: github object should properly initialize', function(t) {
  t.plan(2);

  // mock options
  const options = {
    '<token>' : '12345',
  };

  // mock a github API connection
  const github = Github(options);

  // mock stdout
  const stdout      = new stream.Transform();
  stdout._transform = function (chunk, enc, next) {
    next(null, chunk);
  };

  // execute
  discover(options, github, null, null, stdout, null, null, function () {
    t.equals(github.params.type  , 'token');
    t.equals(github.params.token , '12345');
  });
});


test('cmd-discover: should return the proper urls', function(t) {
  t.plan(4);

  // mock options
  const options = {
    '<token>' : '12345',
  };

  // mock a github API connection
  const github = Github(options);

  // mock stdout
  const stdout      = new stream.Transform();
  stdout._transform = function (chunk, enc, next) {
    next(null, chunk);
  };

  // track which urls were output
  var urls = [];
  stdout.on('data', function (url) {
    urls.push(url.toString());
  });

  // execute
  discover(options, github, null, null, stdout, null, null, function () {
    // assert that 3 urls were output
    t.equals(3, urls.length);

    // assert that the expected urls were returned
    const expected = [
      'git@github.com:johndoe/alpha.git\n',
      'git@github.com:johndoe/bravo.git\n',
      'git@github.com:johndoe/charlie.git\n',
    ];
    expected.forEach(function (url) {
      includes(urls, url) ? t.pass() : t.fail();
    });
  });
});
