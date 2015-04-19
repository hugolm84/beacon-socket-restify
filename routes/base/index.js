module.exports = {
  '/': {
    get: function(req, res, cb) {
      res.json({});
      return cb();
    }
  }
};
