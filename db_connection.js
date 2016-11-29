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

function readAllByQuery(collection_name,query,cb) {
	var collection = db.get(collection_name);
	collection.find(query).then((docs) => {
		if(cb && typeof(cb) == 'function') cb(false,docs);
	}).catch((err) => {
		if(cb && typeof(cb) == 'function') cb(true,err);
	});
}

function readByQuery(collection_name,query,cb) {
	var collection = db.get(collection_name);
	collection.findOne(query).then((doc) => {
		if(cb && typeof(cb) == 'function') cb(false,doc);
	}).catch((err) => {
		if(cb && typeof(cb) == 'function') cb(true,err);
	});
}

function read (collection_name,id,cb) {
	readByQuery(collection_name,{_id:id},cb);
}

function destroyByQuery (collection_name,query,cb) {
	var collection = db.get(collection_name);
	collection.findOneAndDelete(query).then((doc) => {
		if(cb && typeof(cb) == 'function') cb(false,doc);
	}).catch((err) => {
		if(cb && typeof(cb) == 'function') cb(true,err);
	});
}
function destroy (collection_name,id,cb) {
	destroyByQuery(collection_name,{_id:id},cb);
}

function create (collection_name,item,cb) {
	var collection = db.get(collection_name);
	collection.insert(item).then((doc) => {
		if(cb && typeof(cb) == 'function') cb(false,doc);
	}).catch((err) => {
		if(cb && typeof(cb) == 'function') cb(true,err);
	});
}

function updateByQuery (collection_name,query,item,cb) {
	var collection = db.get(collection_name);
	collection.findOneAndUpdate(query,item).then((doc) => {
		if(cb && typeof(cb) == 'function') cb(false,doc);
	}).catch((err) => {
		if(cb && typeof(cb) == 'function') cb(true,err);
	});
}


function update (collection_name, id, item, cb) {
	var tmpItem = item;
	delete tmpItem._id;
	var updateItem = {$set: tmpItem};
	updateByQuery(collection_name,{_id:id},updateItem,cb);
}
function replaceByQuery (collection_name, query, item, cb) {
	var updateItem = item;
	delete updateItem._id;
	updateByQuery(collection_name,query,updateItem,cb);
}
function replace (collection_name, id, item, cb) {
	var updateItem = item;
	delete updateItem._id;
	updateByQuery(collection_name,{_id:id},updateItem,cb);
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
module.exports.readByQuery = readByQuery;
module.exports.readAllByQuery = readAllByQuery;
module.exports.updateByQuery = updateByQuery;
module.exports.replaceByQuery = replaceByQuery;
module.exports.destroyByQuery = destroyByQuery;
