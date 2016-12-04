var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');

var routes = express();

var jwtCheck = jwt({
	  secret: new Buffer('8RUb6SwH0_LbQMztgfS69M07b-JDDhGfWfFX9z6WuJbqRNwVlakZE2G2HwYNHfmn', 'base64'),
	    audience: '2eoGL34nDRULPg3WBuMaVlVQtX9gn3mP'
});

var routeDir = './routes';

// Routes for testing
var testRoot = '/test';
var testRouteList = [
	'devices',
	'devices-by-alias',
	'device-types',
	'stream'
]

// Routes for internal use
var internalRoot = '/internal';
var internalRouteList = [
	'devices-by-alias',
	'stream'
]

// Routes for external use
var externalRoot = '/api';
var externalRouteList = [
	'devices',
	'device-types',
	'stream'
]

routes.use(externalRoot,jwtCheck);

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
routes.use(internalRoot, index);
routes.use(externalRoot, index);

// Load all internal routes
internalRouteList.forEach(function(r) {
	var m = require(routeDir+'/'+r);
	routes.use(internalRoot+'/'+r, m);
});

// Load all external routes
externalRouteList.forEach(function(r) {
	var m = require(routeDir+'/'+r);
	routes.use(externalRoot+'/'+r, m);
});

// Load all test routes
testRouteList.forEach(function(r) {
	var m = require(routeDir+'/'+r);
	routes.use(testRoot+'/'+r, m);
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
