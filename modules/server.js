// Package includes
var restify = require('restify')
    , jwt = require('restify-jwt')
    , jwt_secret = require.main.require('./modules/jwt_secret')
    , passport = require('passport')

module.exports = {
    server: function() {
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