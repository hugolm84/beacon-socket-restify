var jwt_secret = require.main.require('./modules/jwt_secret')
    , jwt = require('jsonwebtoken')

module.exports = {
  '/': {
    get: function(req, res, cb) {
      res.json({});
      return cb();
    }
  }
};
