var express = require('express');
var db = require('../db_connection');
var k_out = require('../kafka_producer');
var router = express.Router();

var collection_name = 'devices';


// Create
router.post('/', function (req,res,next) {
        var newItem = req.body;
	db.create(collection_name, newItem, function(err,item){
                if(err) {
                        res.send(err);
                }
                res.json(item);
        });
});


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


// Replace
router.put('/:id',function(req,res,next) {
        var updateItem = req.body;

	db.replace(collection_name, req.params.id, updateItem, function(err,response){
                if(err) {
                        res.send(err);
                }
                res.json(response);
        });
});

// Update
router.patch('/:id',function(req,res,next) {
        var updateItem = req.body;
	_patch(req.params.id,updateItem,res);
});


// Delete
router.delete('/:id',function(req,res,next) {
	db.destroy(collection_name, req.params.id, function(err,response){
                if(err) {
                        res.send(err);
                }
                res.json(response);
        });
});
// Generic Patch
function _patch(id,updateItem,res,cb) {
	console.log("Patching")
	console.log(JSON.stringify(updateItem));
	db.update(collection_name, id, updateItem, function(err,response){
		console.log("Patch DB returned")
		if (err) {
			console.log("Patch error: ",err)
                        res.send(err);
                } else if (cb) {
			console.log("Patch callback")
			cb(response)
		} else {
			console.log("Patch return")
			res.json(response);
		}
        });
}
function _getDevice(id,cb) {
	db.read(collection_name, id, function(err,item){
		if (cb) { cb(item); }
        });
}
// Module specific API
router.put('/:id/register',function(req,res,next) {
	console.log("Register Function");
	id=req.params.id;
	updateItem={"config.registered": true};
	_patch(id,updateItem,res,function (response) {
		console.log("Patched");
		_getDevice(id, function(device) {
			console.log("Fetched Device");
			var k_msg = {
				deviceID: device.deviceID,
				msg_type: 'registered',
				data: {}
			};
			k_out.send('device_ra',k_msg);
			res.json(response);
		})
	});
	
});
router.put('/:id/unregister',function(req,res,next) {
	updateItem={"config.registered": false};
	_patch(req.params.id,updateItem,res);
});
router.put('/:id/alias',function(req,res,next) {
	var alias = req.body.alias;
	console.log("Alias = ",alias);
	updateItem={"alias": alias};
	_patch(req.params.id,updateItem,res);
});
router.put('/:id/pin',function(req,res,next) {
	var id=req.params.id;
	var pin = req.body.pin;
	var val = req.body.val;
	var field = "req_state.pins."+pin+".val";
	var updateItem = {
		[field]: val
	}
	console.log(JSON.stringify(updateItem));
	_patch(id,updateItem,res,function (response) {
		console.log("Patched");
		_getDevice(id, function(device) {
			console.log("Fetched Device");
			var k_msg = {
				deviceID: device.deviceID,
				msg_type: 'set',
				data: {}
			};
			k_out.send('device_ra',k_msg);
			res.json(response);
		})
	});
});

module.exports = router;
