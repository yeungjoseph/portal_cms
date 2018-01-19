var express = require('express');
var userModel = require('../models/user');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/template', function (req, res) {
	res.render('template',{
		title: "Template Title",
		content: "Template content here."
	});
});

router.get('/auth', function (req, res) {
	res.render('auth', {});
});

router.post('/auth/register', function(req, res) {
	var newUser = new userModel({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
	});
	newUser.save(function(err, user) {
		if (err) return console.log(err);
		res.redirect('/admin');
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
		else if (user == null)
		{
			//Show error message for email not existing
			return res.render('auth', { errormsg: 'Email does not exist'});
		}
		else if (password != user.password)
		{
			//Show error message for wrong password
			return res.render('auth', { errormsg: 'Wrong password'})
		}
		else
		{
			return res.redirect('/admin');
		}
	});
	
});

/*
router.get('/test', function(req, res) {
	var newUser = new userModel({
		email: 'abc@example.com',
		password: 'abcdefg',
		extrafield: 'This is extra',
	});
	newUser.save(function(err, user) {
		if (err) return console.error(err);
		console.log(user);
	});
	// Sends empty response
	res.end();
});
*/



module.exports = router;
