// Package includes
var restify = require('restify')
    , jwt = require('restify-jwt')
    , jwt_secret = require('./jwt')

module.exports = {
    server: function() {
        var server = restify.createServer();
        var routes = require('restify-routes').set(server, __dirname + '/../routes');
        // ALL routes requires BEARER Token, except /token
        server.use(jwt({ secret: jwt_secret}).unless({path: ['/token']}));
        server.use(restify.dateParser());
        server.use(restify.queryParser());
        server.use(restify.jsonp());
        server.use(restify.gzipResponse());
        server.use(restify.bodyParser());
        return server;
    }
};