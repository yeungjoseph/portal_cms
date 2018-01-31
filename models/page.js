var mongoose = require('mongoose');

// Create page data schema and model
var schema = mongoose.Schema({
	title: { type: String, required: true },
	author: { type: Object, required: true },
	content: { type: String, required: true },
	url: { type: String, required: true, unique: true },
	template: { type: String, required: true },
	visible: { type: Boolean, required: true },
	lastEdit: { type: Date, required: true}
});

module.exports = mongoose.model('pages', schema);