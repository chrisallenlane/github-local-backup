const Streamify = require('streamify-string');
const download  = require('../app/cmd-download');
const fs        = require('fs');
const includes  = require('lodash.includes');
const mkdir     = require('mkdirp').sync;
const os        = require('os');
const path      = require('path');
const stream    = require('stream');
const test      = require('tape');

// mock input
const repos = [
  'git@github.com:johndoe/alpha.git',
  'git@github.com:johndoe/bravo.git',
  'git@github.com:johndoe/charlie.git',
].join('\n');

// mock exec function
const exec = function (cmd, options, callback) {
  return callback(null, cmd);
};


test('cmd-download: should create the appropriate directories', function(t) {
  t.plan(1);

  // mock paths
  const targetDir = path.join(os.tmpdir(), 'glb-test-1');
  const userPath  = path.join(targetDir, 'johndoe');

  // mock options
  const options   = {
    '<target-dir>' : targetDir,
  };

  // mock stdin
  const stdin = Streamify(repos);

  // mock stdout
  const stdout      = new stream.Transform();
  stdout._transform = function (chunk, enc, next) {
    next(null, chunk);
  };

  // execute
  download(options, null, stdin, null, stdout, null, exec, function () {
    
    // test: assert that directory was created
    t.ok(fs.existsSync(userPath));

    // clean up
    fs.rmdirSync(userPath);
    fs.rmdirSync(targetDir);
  });
});


test('cmd-download: execute the appropriate commands (clone)', function(t) {
  t.plan(4);

  // mock paths
  const targetDir = path.join(os.tmpdir(), 'glb-test-2');
  const userPath  = path.join(targetDir, 'johndoe');

  // mock options
  const options   = {
    '<target-dir>' : targetDir,
  };

  // mock stdin
  const stdin = Streamify(repos);

  // mock stdout
  const stdout      = new stream.Transform();
  stdout._transform = function (chunk, enc, next) {
    next(null, chunk);
  };

  // track which commands were issued
  var commands = [];
  stdout.on('data', function (command) {
    commands.push(command.toString());
  });

  // execute
  download(options, null, stdin, null, stdout, null, exec, function () {

    // assert that 3 commands were issued
    t.equals(3, commands.length);

    // assert that the expected commands were issued
    const expected = [
      'git clone git@github.com:johndoe/alpha.git --progress 2>&1',
      'git clone git@github.com:johndoe/bravo.git --progress 2>&1',
      'git clone git@github.com:johndoe/charlie.git --progress 2>&1',
    ];
    expected.forEach(function (cmd) {
      includes(commands, cmd) ? t.pass() : t.fail();
    });

    // clean up
    fs.rmdirSync(userPath);
    fs.rmdirSync(targetDir);
  });
});


test('cmd-download: execute the appropriate commands (update)', function(t) {
  t.plan(4);

  // mock paths
  const targetDir   = path.join(os.tmpdir() , 'glb-test-3');
  const userPath    = path.join(targetDir   , 'johndoe');
  const repoAlpha   = path.join(userPath    , 'alpha');
  const repoBravo   = path.join(userPath    , 'bravo');
  const repoCharlie = path.join(userPath    , 'charlie');

  // simulate cloned repos
  mkdir(repoAlpha);
  mkdir(repoBravo);
  mkdir(repoCharlie);

  // mock options
  const options   = {
    '<target-dir>' : targetDir,
  };

  // mock stdin
  const stdin = Streamify(repos);

  // mock stdout
  const stdout      = new stream.Transform();
  stdout._transform = function (chunk, enc, next) {
    next(null, chunk);
  };

  // track which commands were issued
  var commands = [];
  stdout.on('data', function (command) {
    commands.push(command.toString());
  });

  // execute
  download(options, null, stdin, null, stdout, null, exec, function () {

    // assert that 3 commands were issued
    t.equals(3, commands.length);

    // assert that the expected commands were issued
    const expected = [
      'git pull --all 2>&1',
      'git pull --all 2>&1',
      'git pull --all 2>&1',
    ];
    expected.forEach(function (cmd) {
      includes(commands, cmd) ? t.pass() : t.fail();
    });

    // clean up
    fs.rmdirSync(repoAlpha);
    fs.rmdirSync(repoBravo);
    fs.rmdirSync(repoCharlie);
    fs.rmdirSync(userPath);
    fs.rmdirSync(targetDir);
  });
});
