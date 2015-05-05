var passport = require('passport'),
    debug = require('debug')('endpoint:beacon')
    Beacon = require.main.require('./models/beacon')


function is_admin(req, res) {
    if (!req.user.is_admin) {
        res.json({code : 400, msg: "Failed to authenticate administrator", user: req.user});
        return false;
    } 
    return true;
}

module.exports = {
    '/v1/beacon': {
        post: function(req, res, cb) {
            if(!is_admin(req, res)) return cb();
            
            debug(req.body);

            Beacon.create(req.body, function (err, post) {
                if (err) return cb(err);
                res.json(post);
            });
        },
        get: function(req, res, cb) {
            Beacon.find({}, function(err, beacons) {
                if(err) return cb(err);
                res.json(beacons);
            });
        },
        put: function(req, res, cb) {

            if(!is_admin(req, res)) return cb();

            Beacon.update({}, req.body, { multi: true }, function (err, raw) {
                if (err) debug(err);
                else res.json(raw);
            });
        },
        del: function(req, res, cb) {
            if(!is_admin(req, res)) return cb();
            Beacon.find({}).remove(function(err, removed) {
                if (err) return cb(err);
                res.json({ message: removed});
            }); 
        }
    },
    'v1/beacon/:id' : {
        get: function(req, res, cb) {
            Beacon.find({ uuid: req.params.id }).exec(function(err, beacon) {
              if (err) return cb(err);
              res.json(beacon);
            }); 
        },
        del: function(req, res, cb) {
            
            if(!is_admin(req, res)) return cb();
            
            Beacon.find({ uuid: req.params.id }).remove(function(err, removed) {
                if (err) return cb(err);
                res.json({ message: removed});
            }); 
        },
        put: function(req, res, cb) {
            if(!is_admin(req, res)) return cb();
            
            Beacon.update({ uuid: req.params.id }, req.body, {}, function(err, affected) {
                res.json({affected: affected, body: req.body});
            });
        }
    }
};
