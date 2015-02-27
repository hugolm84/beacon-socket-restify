var fs = require('fs');

module.exports = {
    html: function(file, res, next) {
	    fs.readFile(file, function (err, data) {
        if (err) {
            next(err);
            return;
        }
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(data);
        next();
    });
}
};