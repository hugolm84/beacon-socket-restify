var uuid = require('node-uuid')
	, server = require('./modules/server').server() // Initialize restify server
	, io = require('./modules/socket').io(server.server) // Initialize socket.io
	, serve_static = require('./modules/serve_static') // Helper to serve static files
	, jwt_secret = require('./modules/jwt_secret')
    , jwt = require('restify-jwt')

// Requires header Authentication: Bearer TOKEN
server.get('/v1/connect',function(req, res, next) { 
	serve_static.html(__dirname + '/index.html', res, next);
})

server.listen(3000, function () {
    console.log('socket.io server listening at %s', server.url);
});
