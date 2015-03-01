var socketio = require('socket.io')
    , uuid = require('node-uuid')
    , fs = require('fs')
    , socketioJwt = require('socketio-jwt')
    , jwt_secret = require.main.require('./modules/jwt_secret')
    , trilateration = require('trilateration')


beacons = {
 '00:02:5B:00:42:45' : 0,
 '00:02:5B:00:3A:7C' : 1,
 '00:02:5B:00:42:4A' : 2
}

trilateration.addBeacon(0, '00:02:5B:00:42:45', trilateration.vector(1, 5)); // x - y
trilateration.addBeacon(1, '00:02:5B:00:3A:7C', trilateration.vector(3, 1));
trilateration.addBeacon(2, '00:02:5B:00:42:4A', trilateration.vector(4, 4));

var self = module.exports = {
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
            socket.broadcast.emit('message', "joined", socket.decoded_token.username + "(" + genUuid + ")");

            socket.on('disconnect', function(uuid){
                socket.broadcast.emit('message', "left", uuid);
            });
            
            socket.on('position', function(data){

                console.log("Position", JSON.stringify(data));
                
                for(var pos in data) {
                    console.log("Distance to", pos, parseFloat(data[pos]));
                    trilateration.setDistance(beacons[pos], parseFloat(data[pos]));
                }
                var pos = trilateration.calculatePosition();
                console.log("X: " + pos.x + "; Y: " + pos.y); // X: 7; Y: 6.5
                io.emit('position', {x: pos.x, y: pos.y, data : data});
            });
            socket.on('message', function(msg, uuid){
                io.emit('message', msg, uuid);
            });

        });

        //});

        return io;
    }
};