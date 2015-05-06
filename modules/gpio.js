var Gpio = require('onoff').Gpio, 
	debug = require('debug')('GPIO'),
	// 67, 68, 69
  	gpios = { '67': new Gpio(67, 'out'), '68': new Gpio('68', 'out'),'69' : new Gpio(69, 'out')}

function writeGPIO(gpio_id, onOff) {
	debug('WriteGPIO', gpio_id, onOff);
	
	var id_str = gpio_id.toString();
	if(!gpios.hasOwnProperty(id_str)) {
		debug('Creating new GPIO for', gpio_id);
		gpios.id_str = new Gpio(gpio_id, 'out');
	}
	gpios[id_str].write(onOff, function(err) {
		if(err) {
			debug("Writing GPIO_ID", err);
		}
		else {
			gpios[id_str].read(function(err, value) {
				if(err) debug("Reading GPIO_ID", err)
				else debug("GPIO_ID", gpio_id, "is now", (onOff === 0 ? "negative" : "positive"));
			});
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
	negative: function(gpio_id) {
		writeGPIO(gpio_id, 0);
	}
}
