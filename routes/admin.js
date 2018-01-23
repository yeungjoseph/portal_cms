var express = require('express');
var userModel = require('../models/user');
var pageModel = require('../models/page');
var auth = require('../utils/auth');
var router = express.Router();

router.use(auth.requireLogin);

/* Set admin routes */
router.get('/', function (req, res) {
	pageModel.find({ "author._id": req.user._id }, function (err, pages) {
		if (err) return res.send(err);
		res.render('admin', { pages: pages });
	});
});

router.get('/editadmin', function (req, res) {
	res.render('editadmin');
});

router.post('/editadmin', function (req, res) {
	// Status message
	var edit = '';

	userModel.findOne( { email: req.body.email }, function (err, editor) {
		if (err) res.send(err);
		// Check that the email is not duplicated 
		if (!editor || (editor && editor.email === req.user.email))
		{
			// Check the two passwords are equal 
			if (req.body.password1 === req.body.password2)
			{
				// Find the model and update it
				userModel.findByIdAndUpdate( { _id: req.user._id }, 
					{ $set: { name: req.body.name, email: req.body.email, password: req.body.password1 }}, 
					function(err, user) { if (err) return res.send(err); }
				);
			}
			else
			{
				edit = 'The passwords did not match';
			}
		}
		else
		{
			edit = 'Email is already taken!';
		}

		// Update and display status message
		edit = edit === '' ? 'Successfully updated account info!' : edit;
		res.render('editadmin', { editMsg: edit });
	});	
});

router.get('/addpage', function (req, res) {
	res.render('addpage', {});
});

router.post('/addpage/send', function (req, res) {
	pageModel.findOne({ url: req.body.URL }, function (err, page) {
		if (err)
		{
			console.error(err);
			return res.send(err);
		}
		// Display message to user if the URL is taken
		if (page)
		{
			return res.render('addpage', { urlErr: 'That URL has been taken!'});
		}
		// Create a new account
		else
		{
			var newPage = new pageModel({
				title: req.body.title,
				author: {
					email: req.user.email,
					name: req.user.name,
					_id: req.user._id,
				},
				content: req.body.content,
				url: req.body.URL,
				template: req.body.template,
			});
			newPage.save(function(err, user){
				if (err) return console.log(err);
				res.redirect('/admin');
			});
		}
	});
});

// Load a page for editting
router.get('/edit/:url', function(req, res) {
	pageModel.findOne({ url: req.params.url.trim() },
	function(err, page) {
		if(err) return res.send(err);
		// Check if page exists and if the user is the author before editting
		if (page && req.user._id.toString() == page.author._id.toString()) {
			res.render('editpage', { page: page });
		}
		else {
			res.redirect('/admin');
		}
	});
})

// Edit a page
router.post('/edit/:url', function(req, res) {
	pageModel.findOne({ url: req.params.url.trim() },
	function(err, page) {
		if(err) return res.send(err);
		// Check if page exists and if the user is the author before editting
		if (page && req.user._id.toString() == page.author._id.toString()) {
			// Set page values
			// Save page with callback
		}
		else {
			res.redirect('/admin');
		}
	});
})

// Delete a page
router.post('/delete/:url', function(req, res) {
	pageModel.findOne({ url: req.params.url.trim() },
	function(err, page) {
		if(err) return res.send(err);
		// Check if page exists and if the user is the author before deleting
		if (page && req.user._id.toString() == page.author._id.toString()) {
			pageModel.remove({ url: req.params.url.trim()}, function(err){
				if (err) return res.send(err);
			});
		}
		res.redirect('/admin');
	});
})

router.get('/logout', function (req, res) {
	req.session.reset();
	res.redirect('/auth');
});

module.exports = router;
