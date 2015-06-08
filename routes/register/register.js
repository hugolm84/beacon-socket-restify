var passport = require('passport')
	, jwt_secret = require.main.require('./modules/jwt_secret')
    , jwt = require('jsonwebtoken')
	, Account = require.main.require('./models/account')

function registerUser(req, res, cb) {
	Account.register(new Account( {username: req.body.username, password: req.body.password, is_admin: req.body.is_admin} ), req.body.password, function(err, account) {
			if (err) {
				res.json({code : 500, msg: "Failed to registered new user", error: err, req: req.body});
				return cb();
			}

			//passport.authenticate('local')(req, res, function () {
				var token = jwt.sign({username: account.username, is_admin: account.is_admin}, jwt_secret); // {expiresInMinutes: 600}
				res.json({code : 200, msg: "Registered new user", token: token});
				return cb();
			//});
		});
}
module.exports = {
  '/v1/register': {
    post: function(req, res, cb) {

	   	req.body = {}
    	req.body.username = req.headers.username;
    	req.body.password = req.headers.password;
    	req.body.is_admin = (req.headers.is_admin ? req.headers.is_admin : false);
		
		if(req.body.is_admin) {
			Account.findOne({is_admin: true}, function(err,user) { 
				if(err) {
					res.json({code: 500, error: err, msg: "Internal error"}); 
					return cb();
				}
				if(!user) {
					return registerUser(req,res, cb);
				} else {
					if (req.user.is_admin) {
        				return registerUser(req, res, cb);
					}
				}
				res.json({code: 401, error: "Cannot register user", msg: "Internal error"});
				return cb();
			});
		} 
		else 
			registerUser(req,res,cb);
	}
  }
};

