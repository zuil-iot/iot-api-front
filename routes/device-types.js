var express = require('express');
var db = require('../db_connection');
var router = express.Router();

var collection_name = 'device-types';



// Read All
router.get('/', function(req,res,next) {
	db.readAll(collection_name, function(err,list){
		if(err) {
			res.send(err);
		}
	res.json(list);
	});
});

// Read One
router.get('/:id',function(req,res,next) {
	db.read(collection_name, req.params.id, function(err,item){
                if(err) {
                        res.send(err);
                }
                res.json(item);
        });
});



module.exports = router;
