var requires = require('./requires.js');

// listen on port defined in ENV or 8080
requires.server.listen(process.env.PORT || 8080);

// start routes
var routes = require('./routes.js');
