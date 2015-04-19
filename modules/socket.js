var socketio = require('socket.io')
    , uuid = require('node-uuid')
    , fs = require('fs')
    , socketioJwt = require('socketio-jwt')
    , jwt_secret = require.main.require('./modules/jwt_secret')

var self = module.exports = {
    io: function(server) {
        var io = socketio.listen(server);
        // Requires Header Authorization: Bearer TOKEN
        /*io.use(socketioJwt.authorize({
            secret: jwt_secret,
            handshake: true
        }));*/

        io.on('connection', function(socket){

            var genUUID = uuid.v4();
            console.log('a user connected', genUUID);
            
            io.emit('connected', genUUID);

            socket.on('disconnect', function(){
                console.log('user disconnected', genUUID);
            });

            socket.on('message', function(msg){
                console.log('message: ' + msg);
                io.emit('message', msg);
            });

            socket.on('position', function(id, distance, uuid){
                console.log('enter:', id, uuid);
                io.emit('position', id, distance, uuid);
            });

        });


        return io;
    }
};