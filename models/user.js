var mongoose = require('mongoose');

// Create user schema and model
var schema = mongoose.Schema({
	name: String,
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true}
});

module.exports = mongoose.model('users', schema);