module.exports = {
  '/v1': {
    get: function(req, res, cb) {
      res.json({});
      return cb();
    }
  }
};
