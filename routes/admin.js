var express = require('express');
var userModel = require('../models/user');
var pageModel = require('../models/page');
var auth = require('../utils/auth');
var router = express.Router();

router.use(auth.requireLogin);

/* Set admin routes */
router.get('/', function (req, res) {
	var email = req.user.email;
	pageModel.find({ email: email }, function (err, pages){
		if (err) return res.send(err);
		res.render('admin', { pages: pages });
	});
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
		author: req.user.name,
		email: req.user.email,
		content: req.body.content,
		url: req.body.URL,
		template: req.body.template,
	});
	newPage.save(function(err, user){
		if (err) return console.log(err);
		res.redirect('/admin');
	});
});

router.get('/logout', function (req, res) {
	req.session.reset();
	res.redirect('/auth');
});

module.exports = router;
