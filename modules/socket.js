var socketio = require('socket.io')
    , uuid = require('node-uuid')
    , fs = require('fs')
    , socketioJwt = require('socketio-jwt')
    , jwt_secret = require.main.require('./modules/jwt_secret')
    , debug = require('debug')('presence:server');

var clientPositions = {};

var self = module.exports = {
    io: function(server) {
        var io = socketio.listen(server); 
        // Requires Header Authorization: Bearer TOKEN
        io.use(socketioJwt.authorize({
            secret: jwt_secret,
            handshake: true
        }));

        io.on('connection', function(socket){

            debug('a user connected', socket.id);
            
            // Notify all that UUID connected
            io.emit('connected', socket.id);

            // Send all client positions to a newly connected device
            for(var key in clientPositions) {
                if(clientPositions.hasOwnProperty(key)) {
                    debug("Sending", key, clientPositions[key]);
                    io.emit('position', key, clientPositions[key]);
                }
            }

            socket.on('disconnect', function(){
                debug('user disconnected', socket.id);
                // Make sure that disconnecting user leaves all joined rooms
                socket.leaveAll();
                delete clientPositions[socket.id];
                io.emit('disconnect', socket.id);
            });

            socket.on('message', function(msg){
                console.log('message: ' + msg);
                io.emit('message', msg);
            });

            /**
             * Devices send their distance (pre calculated in m) to its closest beacon id
             * then joins the beacon "room".
             * Devices can only be linked to one specific room at a time
             */
            socket.on('position', function(id, distance){
                var prevRoom = socket.room;
                
                if(prevRoom && prevRoom != id) {
                    socket.leave(prevRoom, function(err) {
                        if(err) {
                            debug("Leaving previous room resulted in error:", err);
                            return;
                        } 
                        debug("Socket ID", socket.id, "left room", socket.room);
                    });
                }

                socket.join(id, function(err) {
                    if(err) {
                        debug("Joining room", id, "resulted in error:", err);
                        return;
                    } 

                    debug("Room", id, "now have",  Object.keys(io.sockets.adapter.rooms[id]).length, "connected devices")
                    
                    // Set the new id as current room, emit to listeners that UUID's position changed to beacon ID
                    // Emitting is mostly for graphical demonstration purposes in this usecase, 
                    // but could be used to display information to all connected devices
                    socket.room = id;
                    clientPositions[socket.id] = {beacon: id, distance: distance};
                    io.emit('position', socket.id, clientPositions[socket.id]);
                });
            });
        });
        return io;
    }
};