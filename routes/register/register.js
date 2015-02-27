var passport = require('passport')
	Account = require.main.require('./models/account')

module.exports = {
  '/register': {
    post: function(req, res, cb) {

    	req.body = {}
    	req.body.username = req.headers.username;
    	req.body.password = req.headers.password;

		Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
			if (err) {
				res.json({code : 400, msg: "Failed to registered new user", account: account});
				return cb();
			}

			passport.authenticate('local')(req, res, function () {
				res.json({code : 200, msg: "Registered new user"});
				return cb();
			});
		});
	}
  }
};
