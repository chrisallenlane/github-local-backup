const async   = require('async');
const command = require('shelly');
const fs      = require('fs');
const mkdir   = require('mkdirp').sync;
const parse   = require('./util-parse-repo');
const path    = require('path');
const split   = require('split');
const trim    = require('./xfrm-trim');

// downloads the specified repositories
module.exports = function (options, github, stdin, stderr, stdout, exit, exec, done) {

  // user repos read from stdin
  var repos    = [];

  // read repos from stdin
  stdin
  .pipe(split(/\r?\n/))
  .pipe(trim())
  .on('data', function(url) {
    repos.push(url);
  });

  // process repos when all read
  stdin
  .on('end', function () {
    // process all repositories in parallel
    async.each(repos, backup, function (err) {
      // die on error
      if (err) {
        stderr.write(err.message);
        exit(1);
      }

      // this is a hook used for unit-testing
      if (typeof done === 'function') {
        done();
      }
    }); 
  });

  // backs up a repository
  const backup = function (url, callback) {

    // split the repository name into username and repo name
    const parts = parse(url);
    const user  = parts.user;
    const repo  = parts.name;

    // /<target-dir>/<user>
    const userPath  = path.join(options['<target-dir>'], user);
    mkdir(userPath);

    // /<target-dir>/<user>/<repo>
    const clonePath = path.join(userPath, repo);

    // Assemble the shell command
    // NB: stderr is being directed to stdout because `git clone` seems to
    // write its output to stderr for some reason. Thus, I'm writing
    // _everything_ to stdout, and determining whether or not an error actually
    // occurred by git's exit code.

    // shell command args
    var cmd = '';
    var cwd = '';

    // clone
    if (! fs.existsSync(clonePath)) {
      cmd = command('git clone ? --progress 2>&1', url);
      cwd = userPath;
    }

    // update
    else {
      cmd = command('git pull --all 2>&1');
      cwd = clonePath;
    }

    // execute
    exec(cmd, { cwd: userPath }, function (err, output) {
      if (err !== null) {
        return callback(output.trim()); // errors append an unwanted newline
      }
      stdout.write(output);
      return callback();
    });
  };
};
