var Gpio = require('onoff').Gpio, 
	debug = require('debug')('GPIO'),
  	outs = [new Gpio(67, 'out'), new Gpio(68, 'out'), new Gpio(69, 'out')];

module.exports = {
	setOnOrOff: function(index) {
		var gpio = outs[index];
		var before = gpio.readSync();
		gpio.writeSync(before^1);
		var now = gpio.readSync();
		debug("Gpio was", before, "now it is", now);
	}
}