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

	userModel.findByIdAndUpdate(req.user._id, function (err, editor) {
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
	res.render('addpage');
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
	pageModel.findOne({ _id: req.params.id.trim(), 'author._id': req.user._id }, 
	function(err, page) {
		if (err) return res.send(err);
		if (!page)
			return res.redirect('/auth');
		else
			return res.render('editpage', { page: page });
	});
});

// Save edits to a page
router.post('/edit/:id', function(req, res) {
	pageModel.findOneAndUpdate({ _id: req.params.id.trim(), 'author._id': req.user._id},
	{$set:{ title: req.body.title, content: req.body.content, url: req.body.URL }},
	{ new: true }, function(err, updatedPage) {
		if (err) {
			if (err.code === 11000) {
				console.log('duplicate url');
				return res.render('editpage', { page: {
					_id: req.params.id.trim(),
					title: req.body.title,
					author: req.body.author,
					content: req.body.content,
					url: req.body.URL,
					template: req.body.template,
					visible: true
				}, 
				urlErr: 'That URL has been taken!'});
			}
		}
		else
			res.render('editpage', { page: updatedPage, urlErr: 'Successfully updated!' });
	});
});

// Toggle visibility of a page
router.post('/visible/:id', function(req, res) {
	pageModel.findOne({ _id: req.params.id.trim(), 'author._id': req.user._id },
	 function(err, page) {
		if (err) return res.send(err);
		if (!page) 
			return res.redirect('/auth');
		else {
			// Switch the visibility setting
			page.visible = page.visible ? false : true;
			page.save( function(err) {
				if (err) return res.send(err);
				return res.redirect('/admin');
			});
		}
	});
});

// Delete a page
router.post('/delete/:id', function(req, res) {
	pageModel.remove({ _id: req.params.id.trim(), 'author._id': req.user._id },
		function(err) {
			if (err) return res.send(err);
			res.redirect('/admin');
	});
});

router.get('/logout', function (req, res) {
	req.session.reset();
	res.redirect('/auth');
});

module.exports = router;
