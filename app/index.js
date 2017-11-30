#!/usr/bin/env node

// make package.json accessible
const pkg       = require('../package.json');

// require the dependencies
const GitHubApi = require('github');
const docopt    = require('docopt').docopt;
const exec      = require('child_process').exec;
const fs        = require('fs');
const path      = require('path');

// generate and parse the command-line options
const doc       = fs.readFileSync(path.join(__dirname, 'docopt.txt'), 'utf8');
const options   = docopt(doc, { version: pkg.version });

//console.log(options);
const command =
  (options.discover) ? require('./cmd-discover') :
  (options.download) ? require('./cmd-download') : function() {
    console.warn('Invalid subcommand');
    process.exit(1);
  };

// initialize an API connection
const github = new GitHubApi({});

// this looks awkward, but makes proper unit-testing possible
command(
  options,
  github,
  process.stdin,
  process.stderr,
  process.stdout,
  process.exit,
  exec
);
