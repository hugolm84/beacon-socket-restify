var socketio = require('socket.io')
    , uuid = require('node-uuid')
    , fs = require('fs')
    , socketioJwt = require('socketio-jwt')
    , jwt_secret = require.main.require('./modules/jwt_secret')

module.exports = {
    io: function(server) {
        var io = socketio.listen(server);

        // Requires Header Authorization: Bearer TOKEN
        io.use(socketioJwt.authorize({
            secret: jwt_secret,
            handshake: true
        }));
        
        
        io.on('connection', function(socket){
            console.log('a user connected', socket.decoded_token);
            var genUuid = uuid.v4();
            io.to(socket.id).emit('connected', genUuid, socket.decoded_token.username);
            socket.broadcast.emit('chat message', "joined", socket.decoded_token.username + "(" + genUuid + ")");

            socket.on('disconnect', function(uuid){
                socket.broadcast.emit('chat message', "left", uuid);
            });

            socket.on('chat message', function(msg, uuid){
                io.emit('chat message', msg, uuid);
            });

        });

        return io;
    }
};