const async   = require('async');

// number of repositories to fetch per API "page"
const perPage = 100;

// discovers user repositories on Github
module.exports = function (options, github, stdin, stderr, stdout, exit, exec, done) {

  // user token 
  github.authenticate({
    type  : 'token',
    token : options['<token>'],
  });

  // github API options
  var params = {
    per_page : perPage,
    page     : 1,
  };

  // count repositories returned
  var repositoryCount = 0;

  // get all of the user's repositories
  const page = function (cb) {
    github.repos.getAll(params, function (err, response) {

      // handle errors
      if (err) {
        // Github packaged this in some bizzarre way
        msg = JSON.parse(err.message).message;
        stderr.write(msg);
        exit(1);
      }

      // fetch the next page
      params.page++;

      // track the repositories returned
      repositoryCount = response.data.length;

      // pick repository information
      response.data.forEach(function (repo) {
        stdout.write(repo.ssh_url + '\n');
      });

      return cb();
    });
  };

  // determine if a full page of results have been returned
  const test = function () {
    return repositoryCount === perPage;
  };

  // fetch all pages
  async.doWhilst(page, test, function (err) {
    if (err) {
      stderr.write(err.message);
      exit(1);
    }

    // this is a hook used for unit-testing
    if (typeof done === 'function') {
      done();
    }
  });
};
