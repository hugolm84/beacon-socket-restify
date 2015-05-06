var Gpio = require('onoff').Gpio, 
	debug = require('debug')('GPIO'),
	// 67, 68, 69
  	gpios = {}

function writeGPIO(gpio_id, onOff) {
	if(!gpios.hasOwnProperty(gpio_id)) {
		gpios[gpio_id] = new Gpio(gpio_id, 'out');
	}
	gpios[gpio_id].write(onOff, function(err) {
		if(err) {
			debug("Writing GPIO_ID", err);
		}
		else {
			gpios[gpio_id].read(err, value) {
				if(err) debug("Reading GPIO_ID", err)
				else debug("GPIO_ID", gpio_id, "is now", (onOff === 0 ? "negative" : "positive"));
			}
		}
	});
}
module.exports = {
	freeAll: function(cb) {
		var count = 0;
		for(var key in gpios) {
			gpios[key].writeSync(0);
			gpios[key].unexport();
			delete gpios[key];
			count++;
		}
		cb(count);
	},
	positive: function(gpio_id) {
		writeGPIO(gpio_id, 1);
	},
	negative: function(index) {
		writeGPIO(gpio_id, 0);
	}
}
