var express = require('express');
var db = require('../db_connection');
var router = express.Router();

var collection_name = 'stream_data';


// Read One
router.get('/',function(req,res,next) {
	var deviceID = req.query.deviceID;
	var io_name = req.query.io_name;
	var slot_name = req.query.slot_name;
	var start_h = parseInt(req.query.start_h);
	var start_m = parseInt(req.query.start_m);
	var end_h = parseInt(req.query.end_h);
	var end_m = parseInt(req.query.end_m);
	var start_date = new Date();
	var end_date = new Date();
	start_date.setHours(start_date.getHours()+start_h);
	start_date.setMinutes(start_date.getMinutes()+start_m);
	end_date.setHours(end_date.getHours()+end_h);
	end_date.setMinutes(end_date.getMinutes()+end_m);
	var start = start_date.toISOString();
	var end = end_date.toISOString();
	var q = { $and: [
		{"timestamp" : { $gte: start} },
		{"timestamp" : { $lte: end} },
		{"deviceID" : deviceID },
		{"io_name" : io_name },
		{"slot_name" : slot_name },
		]}
	db.readAllByQuery(collection_name, q, function(err,list){
                if(err) {
                        res.send(err);
                }
                res.json(list);
        });
});

module.exports = router;
