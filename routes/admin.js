var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

// Create page data schema and model
var pageSchema = mongoose.Schema({
	title: { type: String, required: true},
	author: { type: String, required: true },
	email: { type: String, required: true },
	content: { type: String, required: true},
	url: { type: String, required: true},
	template: { type: String, required: true}
});
var pageModel = mongoose.model('pages', pageSchema);


/* Set admin routes */
router.get('/', function (req, res) {
	res.render('admin', {});
});

router.get('/editadmin', function (req, res) {
	res.render('editadmin', {});
});

router.get('/addpage', function (req, res) {
	res.render('editpage', {});
});

router.post('/addpage/send', function (req, res) {
	var newPage = new pageModel({
		title: req.body.title,
		author: req.body.author,
		email: req.body.email,
		content: req.body.content,
		url: req.body.URL,
		template: req.body.template,
	});
	newPage.save(function(err, user){
		if (err) return console.log(err);
		console.log('Added the thing!');
		res.redirect('/admin');
	});
});

module.exports = router;
