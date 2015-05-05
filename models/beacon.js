var mongoose = require('mongoose'),
    debug = require('debug')('Beacon-Schema')
    Schema = mongoose.Schema

var Beacon = new Schema({
    uuid: { type: String, required: true, unique: true }, // UUID for beacon
    num_attached: { type: Number, default: 0 }, // Number of attached clients in this beacons proximity
    is_auto: { type: Boolean, default: false }, // Auto performs action, eg. ON if less than 10 connected
    state: { type: String, default: null},
    capability :  { 
    	positive: { type: String, required: true}, // On, Open etc
    	negative: { type: String, required: true} // Off, Close etc
    },
    do_if_less_then: { // Auto performs action if number of attached is less then
    	number: Number,
    	action: String
    },
    do_if_more_then: { // Auto performs action if number of attached is bigger then
    	number: Number,
    	action: String
    }
});


Beacon.methods.doIfAuto = function(cb) {
    if(this.is_auto) {
        var prevState = this.state;
        if(this.num_attached <= this.do_if_less_then.number) {
            this.state = this.do_if_less_then.action;
        }
        else if(this.num_attached >= this.do_if_more_then.number) {
            this.state = this.do_if_more_then.action;
        }
        this.save();
        if(cb)
            return cb(null, !(this.state === prevState), this);
    }
}

Beacon.statics.inc = function(id, count, cb) {
    var that = this;
    this.update({ uuid: id }, {$inc : {num_attached: count}}, {}, function(err, affected) {
        if(err) return cb(err);
        that.findOne({ uuid: id }, function(err, beacon) {
            if(err) return cb(err);
            return beacon.doIfAuto(cb);
        }); 
    });
}

module.exports = mongoose.model('Beacon', Beacon);