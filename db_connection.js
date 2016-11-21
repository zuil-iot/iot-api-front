var mongodb = require('mongodb');
const monk = require('monk');

const mongoURL = 'mongodb://iot-mongo:27017/iot';
//const mongoURL = 'mongodb://192.168.100.2:27017/iot';


var on_ready_cb = null;
var db = null;

function readAll (collection_name,cb) {
	var collection = db.get(collection_name);
	collection.find({}).then((docs) => {
		if(cb && typeof(cb) == 'function') cb(false,docs);
	}).catch((err) => {
		if(cb && typeof(cb) == 'function') cb(true,err);
	});
}

function read (collection_name,id,cb) {
	var collection = db.get(collection_name);
	collection.findOne({_id: id}).then((doc) => {
		if(cb && typeof(cb) == 'function') cb(false,doc);
	}).catch((err) => {
		if(cb && typeof(cb) == 'function') cb(true,err);
	});
}

function destroy (collection_name,id,cb) {
	var collection = db.get(collection_name);
	collection.findOneAndDelete({_id: id}).then((doc) => {
		if(cb && typeof(cb) == 'function') cb(false,doc);
	}).catch((err) => {
		if(cb && typeof(cb) == 'function') cb(true,err);
	});
}

function create (collection_name,item,cb) {
	var collection = db.get(collection_name);
	collection.insert(item).then((doc) => {
		if(cb && typeof(cb) == 'function') cb(false,doc);
	}).catch((err) => {
		if(cb && typeof(cb) == 'function') cb(true,err);
	});
}

function _update (collection_name,id,item,cb) {
	var collection = db.get(collection_name);
	console.log("DB: _update, id = ",id);
	collection.findOneAndUpdate({_id: id},item).then((doc) => {
		console.log("DB: _update, success");
		if(cb && typeof(cb) == 'function') cb(false,doc);
	}).catch((err) => {
		console.log("DB: _update, error = ",err);
		if(cb && typeof(cb) == 'function') cb(true,err);
	});
}



function update (collection_name, id, item, cb) {
	console.log("DB: update");
	var tmpItem = item;
	delete tmpItem._id;
	var updateItem = {$set: tmpItem};
	_update(collection_name,id,updateItem,cb);
}
function replace (collection_name, id, item, cb) {
	var updateItem = item;
	delete updateItem._id;
	_update(collection_name,id,updateItem,cb);
}


function set_on_ready(cb) {
	if (cb) { on_ready_cb = cb }
}
function start() {
	console.log("Starting Monk: "+mongoURL);
	db = monk(mongoURL);
	db.then(() => {
		console.log("\tConnected");
		if (on_ready_cb) { on_ready_cb() }
	})
}

module.exports.set_on_ready = set_on_ready;
module.exports.start = start;
module.exports.create = create;
module.exports.read = read;
module.exports.readAll = readAll;
module.exports.update = update;
module.exports.replace = replace;
module.exports.destroy = destroy;
