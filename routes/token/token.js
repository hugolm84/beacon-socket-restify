var jwt_secret = require('./../../modules/jwt')
    , jwt = require('jsonwebtoken')

module.exports = {
  '/token': {
    post: function(req, res, cb) {

      var username = req.headers.username;
      var password = req.headers.password;

      var profile = {
        username: username,
        email: username+'@doe.com',
        id: 123,
        api_key: 12345678
      };

      var token = jwt.sign(profile, jwt_secret, {expiresInMinutes: 60});
      res.json({"token" : token});
      return cb();
    }
  }
};
