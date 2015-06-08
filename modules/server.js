// Package includes
var restify = require('restify')
    , jwt = require('restify-jwt')
    , jwt_secret = require.main.require('./modules/jwt_secret')
    , passport = require('passport')
    , debug = require('debug')('presence:server')
    , Beacon = require.main.require('./models/beacon')

module.exports = {
    server: function() {
	Beacon.update({}, { state: "negative", num_attached: 0 }, { multi: true }, function (err, raw) {
        	if (err) debug(err);
        	else debug("Cleared all beacons", raw);
        	debug("Ok");
    	});

        var server = restify.createServer();
        // ALL routes requires BEARER Token, except /token and /register
        server.use(jwt({ secret: jwt_secret}).unless({path: ['/v1/token', '/v1/register'] }));
        server.use(passport.initialize());
        server.use(restify.dateParser());
        server.use(restify.queryParser());
        server.use(restify.jsonp());
        server.use(restify.gzipResponse());
        server.use(restify.bodyParser());
        var routes = require('restify-routes').set(server, __dirname + '/../routes');
        
        return server;
    }
};
