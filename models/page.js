var mongoose = require('mongoose');

// Create page data schema and model
var schema = mongoose.Schema({
	title: { type: String, required: true},
	author: { type: String, required: true },
	email: { type: String, required: true },
	content: { type: String, required: true},
	url: { type: String, required: true},
	template: { type: String, required: true}
});

module.exports = mongoose.model('pages', schema);