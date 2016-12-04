var express = require('express');
var db = require('../db_connection');
var k_out = require('../kafka_producer');
var router = express.Router();

var collection_name = 'devices';


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

router.put('/set',function(req,res,next) {
	var deviceAlias	= req.body.deviceAlias.toLowerCase().replace(/ +/g,"_");		// Alias name of device
	var pinAlias	= req.body.pinAlias.toLowerCase().replace(/ +/g,"_");		// Alias name of pin
	var pinValue	= req.body.pinValue.toLowerCase().replace(/ +/g,"_");		// on/off
	
console.log(deviceAlias,pinAlias,pinValue);
	res.send("Not Implemented");
	console.log("Alexa set needs fixed");


	// Get device
	db.readByQuery(collection_name, {alias_index: deviceAlias}, function(err,item){
		if (!err && item != null) {
			// Find pin
			var pin=null;
			var pins = item.config.pins;
			for (p in pins) {
				if (pins[p].alias_index == pinAlias) { pin = p; }
			}
			if (pin == null) { res.send("Error"); return }
			if (pinValue == 'on') { val = true } else { val = false }
			// Update database
			var field = "req_state.pins."+pin+".val";
			var updateItem = {
				[field]: val
			}
			_patch(item._id,updateItem,res,function (response) {
				// Send kafka message
				var k_msg = {
					deviceID: item.deviceID,
					msg_type: 'set',
					data: {}
				};
				k_out.send('device_ra',k_msg);
				res.json(response);
			});
		} else { 
console.log("not found");
			res.send("not found");
		}
	});
});

module.exports = router;
