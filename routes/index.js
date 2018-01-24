var express = require('express');
var userModel = require('../models/user');
var pageModel = require('../models/page');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('template', { 
		title: 'Home',
		content: "Welcome to the homepage."
	});
});

router.get('/auth', function (req, res) {
	res.render('auth');
});

router.post('/auth/register', function(req, res) {
	var newUser = new userModel({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
	});
	newUser.save(function(err, user) {
		if (err) 
		{
			if (err.code == 11000)
				return res.render('auth', { regErr: 'Email is already in use!'});
			return res.send(err);
		}
		req.session.user = user;
		res.redirect('/admin');
	});
});

router.post('/auth/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	userModel.findOne({ email: email }, function (err, user) {
		if (err) return res.send(err);
		//Show error message if login credentials are incorrect
		if (user == null || password != user.password)
			res.render('auth', { loginErr: 'Email or password is incorrect.'});
		else
		{
			req.session.user = user; // Sets the response header to add a cookie
			res.redirect('/admin');
		}
	});	
});

router.get('/:page', function(req, res, next) {
	pageModel.findOne({ url: req.params.page.trim() },
	function(err, page) {
		if(err) return res.send(err);
		if (page && page.visible) {
			res.render('template', {
				title: page.title,
				content: page.content,
			});
		}
		else {
			next();
		} 
	});
});

module.exports = router;