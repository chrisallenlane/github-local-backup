const stream = require('stream');

module.exports = function () {
  const trim = new stream.Transform({ objectMode: true });

  // Define our transform function
  trim._transform = function (line, enc, next) {
    line = line.trim();
    if (line != '') {
      next(null, line);
    }
  };

  return trim;
};
