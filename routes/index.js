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
	res.render('auth', {});
});

router.post('/auth/register', function(req, res) {
	// Check that the email is not already in use
	userModel.findOne({ email: req.body.email }, function (err, user) {
		if (err)
		{
			console.error(err);
			return res.send(err);
		}
		// Display message to user if the email is taken
		if (user)
		{
			return res.render('auth', { regErr: 'Email is already in use!'});
		}
		// Create a new account
		else
		{
			var newUser = new userModel({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
			});
			newUser.save(function(err, user) {
				if (err) return console.log(err);
				req.session.user = user;
				res.redirect('/admin');
			});
		}
	});
});

router.post('/auth/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	userModel.findOne({ email: email }, function (err, user) {
		if (err) 
		{
			console.err(err);
			return res.send(err);
		}
		else if (user == null || password != user.password)
		{
			//Show error message for email not existing
			return res.render('auth', { loginErr: 'Email or password is incorrect.'});
		}
		/*else if (password != user.password)
		{
			//Show error message for wrong password
			return res.render('auth', { loginErr: 'Password is incorrect'});
		}*/
		else
		{
			req.session.user = user; // Sets the response header to add a cookie
			return res.redirect('/admin');
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