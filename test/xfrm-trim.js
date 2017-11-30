const Streamify = require('streamify-string');
const split     = require('split');
const test      = require('tape');
const trim      = require('../app/xfrm-trim');


test('xfrm-trim: should properly trim urls', function(t) {
  t.plan(3);

  const repos = [
    'git@github.com:johndoe/alpha.git',
    '  git@github.com:johndoe/bravo.git  ',
    'git@github.com:johndoe/charlie.git\n',
  ].join('\n');

  const expected = [
    'git@github.com:johndoe/alpha.git',
    'git@github.com:johndoe/bravo.git',
    'git@github.com:johndoe/charlie.git',
  ];

  var i = 0;

  Streamify(repos)
    .pipe(split(/\r?\n/))
    .pipe(trim())
    .on('data', function (trimmed) {
      t.equals(trimmed, expected[i]);
      i++;
    });
});
