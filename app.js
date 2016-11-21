var k_out = require('./kafka_producer');
var db = require('./db_connection');

function start() {
	var debug = require('debug')('my-application');
	var routes = require('./routes');
	routes.set('port', process.env.PORT || 3000);
	var server = routes.listen(routes.get('port'), function() {
		  debug('Express server listening on port ' + server.address().port);
		  console.log("Listening on port: ",server.address().port);
	});
}

db.set_on_ready(k_out.start);
k_out.set_on_ready(start);
db.start();


