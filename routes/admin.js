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
				userModel.findByIdAndUpdate(req.user._id, 
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

router.post('/addpage', function (req, res) {
	pageModel.findOne({ url: req.body.URL }, function (err, page) {
		if (err) return res.send(err);
		// Display message to user if the URL is taken
		if (page)
			res.render('addpage', { urlErr: 'That URL has been taken!'});
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
				visible: true,
			});
			newPage.save(function(err, user){
				if (err) return console.log(err);
				res.redirect('/admin');
			});
		}
	});
});

// Load a page for editting
router.get('/edit/:id', function(req, res) {
	pageModel.findById(req.params.id.trim(), function(err, page) {
		if (err) return res.send(err);
		// Check if page exists and if the user is the author before editting
		if (page && req.user._id.toString() == page.author._id.toString())
			res.render('editpage', { page: page });
		else 
			res.redirect('/admin');
	});
});

// Save edits to a page
router.post('/edit/:id', function(req, res) {
	pageModel.findById(req.params.id.trim(), function(err, page) {
		if (err) return res.send(err);
		// Check if page exists and if the user is the author before editting
		if (page && req.user._id.toString() == page.author._id.toString()) {
			// Check for duplicate URL
			pageModel.findOne({ _id: req.body.iid }, function (err, dup) {
				if (err) return res.send(err);
				// Check that this URL does not exist in the current database or
				// if it does, it belongs to the current page.
				if (!dup || (dup && dup.url === req.params.url)) {
					// Set page values
					page.title = req.body.title;
					page.content = req.body.content;
					page.url = req.body.URL;
					// Save page 
					page.save(function (err, updatedPage) {
						if (err) return res.send(err);
						res.render('editpage', { page: page, urlErr: 'Successfully updated!' });
					});
				}
				else 
					res.render('editpage', { page: page, urlErr: 'That URL has been taken!'});
			});
		}
		else 
			res.redirect('/admin');
	});
});

// Toggle visibility of a page
router.post('/visible/:id', function(req, res) {
	pageModel.findById(req.params.id.trim(), function(err, page) {
		if (err) return res.send(err);
		// Check if page exists and if the user is the author before toggling visibility
		if (page && req.user._id.toString() == page.author._id.toString()) {
			// Switch the visibility setting
			page.visible = page.visible ? false : true;
			page.save( function(err) {
				if (err) return res.send(err);
				//return res.render('admin', { visibleUpdate: "Updated the visibility of your page!" });
			});
		}
	});
	res.redirect('/admin');
});

// Delete a page
router.post('/delete/:id', function(req, res) {
	pageModel.findById(req.params.id.trim(), function(err, page) {
		if (err) return res.send(err);
		// Check if page exists and if the user is the author before deleting
		if (page && req.user._id.toString() == page.author._id.toString()) {
			pageModel.remove({ _id: req.params.id.trim()}, function(err){
				if (err) return res.send(err);
			});
		}
		res.redirect('/admin');
	});
});

router.get('/logout', function (req, res) {
	req.session.reset();
	res.redirect('/auth');
});

module.exports = router;
