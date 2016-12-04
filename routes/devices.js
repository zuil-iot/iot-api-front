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
	db.update(collection_name, id, updateItem, function(err,response){
		if (err) {
                        res.send(err);
                } else if (cb) {
			cb(response)
		} else {
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
function _reg(req,res,id,registered) {
	updateItem={"registered": registered};
	_patch(id,updateItem,res,function (response) {
		_getDevice(id, function(device) {
			var k_msg = {
				deviceID: device.deviceID,
				msg_type: 'registered',
				data: {}
			};
			k_out.send('device_ra',k_msg);
			res.json(response);
		})
	});
}
router.put('/:id/register',function(req,res,next) {
	id=req.params.id;
	registered=true;
	_reg(req,res,id,registered);
});
router.put('/:id/unregister',function(req,res,next) {
	id=req.params.id;
	registered=false;
	_reg(req,res,id,registered);
});
router.put('/:id/alias',function(req,res,next) {
	var alias = req.body.alias;
	updateItem={
		"alias"		: alias,
		"alias_index"	: alias.toLowerCase().replace(/ +/g,"_")
	};
	_patch(req.params.id,updateItem,res);
});
router.put('/:id/type',function(req,res,next) {
	var id=req.params.id;
	var typeID = req.body.typeID;
	updateItem={
		"typeID"	: typeID,
	};
	_patch(id,updateItem,res,function (response) {
		_getDevice(id, function(device) {
			var k_msg = {
				deviceID: device.deviceID,
				msg_type: 'type',
				data: {
					typeID: typeID
				}
			};
			k_out.send('device_ra',k_msg);
			res.json(response);
		})
	});
});
router.put('/:id/set',function(req,res,next) {
	var id=req.params.id;
	var io_name = req.body.io_name;
	var slot_name = req.body.slot_name;
	var val = req.body.val;
	var field = "req_state.io."+io_name+".slots."+slot_name+".val";
	var updateItem = {
		[field]: val
	}
	_patch(id,updateItem,res,function (response) {
		_getDevice(id, function(device) {
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
