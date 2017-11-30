module.exports = function (url) {
  const begin = url.indexOf('github.com') + 11;
  const pair  = url.slice(begin, -4);
  const parts = pair.split('/');
  return {
    user: parts[0],
    name: parts[1],
  };
};
