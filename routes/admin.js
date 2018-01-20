var express = require('express');
var pageModel = require('../models/page');
var router = express.Router();

/* Define require login function */
function requireLogin (req, res, next) {
	if (!req.user) {
	  res.redirect('/auth');
	} else {
	  next();
	}
};

/* Set admin routes */
router.get('/', requireLogin, function (req, res) {
	res.render('admin', {});
});

router.get('/editadmin', requireLogin, function (req, res) {
	res.render('editadmin', {});
});

router.get('/addpage', requireLogin, function (req, res) {
	res.render('editpage', {});
});

router.post('/addpage/send', requireLogin, function (req, res) {
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
		res.redirect('/admin');
	});
});

router.get('/logout', function (req, res) {
	req.session.reset();
	res.redirect('/auth');
});

module.exports = router;
