module.exports = {
  '/connect': {
    get: function(req, res, cb) {
      res.json({});
      return cb();
    }
  }
};
