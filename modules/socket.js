var socketio = require('socket.io')
    , fs = require('fs')
    , socketioJwt = require('socketio-jwt')
    , jwt_secret = require.main.require('./modules/jwt_secret')
    , Beacon = require.main.require('./models/beacon')
    , debug = require('debug')('presence:server')
    , beaconDebug = require('debug')('presence:beacon')
    , clientPositions = {}

function disconnectOne(id, io) {
    var client = clientPositions[id];
    if(client && client.beacon) {
        Beacon.inc(client.beacon, -1, function(err, changed, beacon) {
            if(err){ beaconDebug("Decrement error", err); return; }
            if(changed) { 
		beaconDebug("Performed action", beacon.state)
                io.emit('state_changed', beacon, beacon.state);
	    }
            beaconDebug("disconnected", id);
        });
        delete clientPositions[id];
    }
}

function sendAllConnectedDevices(io) {
    // Send all client positions to a newly connected device
    for(var key in clientPositions) {
        if(clientPositions.hasOwnProperty(key)) {
            debug("Sending", key, clientPositions[key]);
            io.emit('position', key, clientPositions[key]);
        }
    }
}

var self = module.exports = {
    io: function(server) {
        var io = socketio.listen(server); 
        // Requires Header Authorization: Bearer TOKEN
        io.use(socketioJwt.authorize({
            secret: jwt_secret,
            handshake: true
        }));

        // Reset all beacons if we exited in a bad way
        Beacon.update({}, { num_attached: 0 }, { multi: true }, function (err, raw) {
            if (err) beaconDebug(err);
        });

        io.on('connection', function(socket){

            debug('a user connected', socket.id);
            
            // Notify all that UUID connected
            io.emit('connected', socket.id);

            sendAllConnectedDevices(io);

            socket.on('disconnect', function(){
                debug('user disconnected', socket.id);
                // Make sure that disconnecting user leaves all joined rooms
                disconnectOne(socket.id, io);
                socket.leaveAll();
                io.emit('disconnect', socket.id);
            });

            socket.on('message', function(msg){
                debug('message: ' + msg);
                io.emit('message', msg);
            });

            socket.on('leave', function(uuid) {
                debug('leave', uuid);

                var prevRoom = socket.room;
                socket.leave(prevRoom, function(err) {
                    if(err) {
                        debug("Leaving previous room resulted in error:", err);
                        return;
                    } 
                    disconnectOne(socket.id, io);
                    debug("Socket ID", socket.id, "left room", socket.room);
                });

                io.emit('leave', uuid);
            });

            socket.on('get_states', function() {
                debug(socket.id, "asked for states");
                Beacon.find({}, function(err, beacons) {
                    if (!err){ 
			debug('Sendning', beacons);
                        io.emit('get_states', beacons);
                    } else { 
                        debug("Failed to retreive all beacons", err);
                    }
                });
            });

            socket.on('state_changed', function(beacon, state){
                debug('state_changed: ' + beacon, state);
                io.emit('state_changed', beacon, state);
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
                        disconnectOne(socket.id, io);
                        debug("Socket ID", socket.id, "left room", socket.room);
                    });
                }

                socket.join(id, function(err) {
                    if(err) {
                        debug("Joining room", id, "resulted in error:", err);
                        return;
                    } 

                    Beacon.inc(id, 1, function(err, changed, beacon) {
                        if(err){ debug("Increment error", err); return; }
                        if(changed) { 
                            debug("Performed action", changed);
                            io.emit('state_changed', beacon, changed);
                        }
                        else {
                            debug("State did not change", changed);
                            io.emit('state_changed', beacon, changed);
                        }
                    });                   

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
