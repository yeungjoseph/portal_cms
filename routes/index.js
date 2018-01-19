var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

// Create user schema and model
var userSchema = mongoose.Schema({
	name: String,
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true}
});
var userModel = mongoose.model('users', userSchema);



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
			console.log('Error with findOne function!!!');
		}
		else
		{
			if (user != null && password === user.password)
			 return res.redirect('/admin');
		}
		
		return res.redirect('/auth');	
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
