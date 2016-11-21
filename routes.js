var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var routes = express();

/// Configure routes
var apiRoot = '/api';
var routeDir = './routes';
var routeList = [
	'devices',
	'device_types'
]

// view engine setup
routes.set('views', path.join(__dirname, 'views'));
routes.set('view engine', 'pug');

// Set up resources
routes.use(logger('dev'));
routes.use(bodyParser.json());
//routes.use(bodyParser.urlencoded());
routes.use(express.static(path.join(__dirname, 'public')));

// Setup special routes

// Index
var index = require(routeDir+'/index');
routes.use('/', index);
// Docs
var docs = require(routeDir+'/docs');
routes.use('/docs', docs);
routes.use(apiRoot, docs);


// Load all standard routes
routeList.forEach(function(r) {
	var m = require(routeDir+'/'+r);
	routes.use(apiRoot+'/'+r, m);
});



/// catch 404 and forwarding to error handler
routes.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (routes.get('env') === 'development') {
    routes.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
	    message: err.message,
	    error: err
	});
    });
}

// production error handler
// no stacktraces leaked to user
routes.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
	message: err.message,
	error: {}
    });
});


module.exports = routes;
