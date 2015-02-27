var jwt_secret = require('./../../modules/jwt')
    , jwt = require('jsonwebtoken')

module.exports = {
  '/': {
    get: function(req, res, cb) {
      res.json({});
      return cb();
    }
  }
};
