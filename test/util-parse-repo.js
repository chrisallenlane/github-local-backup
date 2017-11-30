const parse = require('../app/util-parse-repo');
const test  = require('tape');

test('util-parse-repo: should parse SSH urls properly', function(t) {
  t.plan(2);
  const url   = 'git@github.com:john-doe/my-repo.git';
  const parts = parse(url);
  t.equals(parts.user, 'john-doe');
  t.equals(parts.name, 'my-repo');
});

test('util-parse-repo: should parse HTTPS urls properly', function(t) {
  t.plan(2);
  const url   = 'https://github.com/john-doe/my-repo.git';
  const parts = parse(url);
  t.equals(parts.user, 'john-doe');
  t.equals(parts.name, 'my-repo');
});
