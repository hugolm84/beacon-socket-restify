var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = {
	passport: function() {
		// passport config
		var Account = require.main.require('./models/account');
		passport.use(new LocalStrategy(Account.authenticate()));
		passport.serializeUser(Account.serializeUser());
		passport.deserializeUser(Account.deserializeUser());
		// mongoose
		mongoose.connect('mongodb://10.40.230.78/presence_db');
		return passport;
	}
};