var passport = require.main.require('./modules/passport').passport()
    , jwt_secret = require.main.require('./modules/jwt_secret')
    , jwt = require('jsonwebtoken')

module.exports = {
  '/token': {
    post: function(req, res, cb) {

      // Using headers username and password
      req.body = {}
      req.body.username = req.headers.username;
      req.body.password = req.headers.password;

      passport.authenticate('local', function(err, user, info) {
        if (err) { 
          res.json({code : 400, msg: "Failed to authenticate", err: err});
          return cb(err);
        }
        
        if (!user) { 
          res.json({code : 401, msg: "Failed to authenticate user"});
          return cb(); 
        }
        
        req.logIn(user, function(err) {
          if (err) { 
            res.json({code : 401, msg: "Failed to login", err: err});
            return cb(); 
          }
          var token = jwt.sign({username: user.username}, jwt_secret, {expiresInMinutes: 60});
          res.json({code: 200, "token" : token});
          return cb();  
        });
      })(req, res, cb);
  }
}
};
