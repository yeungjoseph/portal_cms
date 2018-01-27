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
	res.render('editadmin', { person: req.user });
});

router.post('/editadmin', function (req, res) {
	if (req.body.password1 === req.body.password2)
	{
		userModel.findByIdAndUpdate(req.user._id, {$set: { 
			name: req.body.name, 
			email: req.body.email,
			password: req.body.password1
		}}, { new: true }, function(err, newUser) {
				if (err) {
					if (err.code === 11000)
						return res.render('editadmin', {
							editMsg: 'That email has already been taken!',
							person: req.user });
					return res.send(err);
				}
				else
					return res.render('editadmin', {
						editMsg: 'Successfully updated account info!',
						person: newUser
				});
		});
	}
	else 
		res.render('editadmin', { editMsg: 'The passwords did not match', person: req.user });
});

router.post('/addpage', function (req, res) {
	var newPage = new pageModel({
		title: req.body.title,
		author: {
			email: req.user.email,
			name: req.user.name,
			_id: req.user._id,
		},
		content: req.body.content,
		url: req.body.url,
		template: req.body.template,
		visible: true,
	});
	newPage.save(function(err, page) {
		if (err) return res.status(500).send(err);
		return res.send(page);
	});
});

// Load a page for editting
router.get('/page/edit/:id', function(req, res) {
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
router.post('/page/visibility/:id', function(req, res) {
	pageModel.findOne({ _id: req.params.id.trim(), 'author._id': req.user._id },
	 function(err, page) {
		if (err) return res.status(500).send(err);
		if (!page) return res.status(404).send("Page not found.");
		else {
			// Switch the visibility setting
			page.visible = page.visible ? false : true;
			page.save( function(err) {
				if (err) return res.status(500).send(err);
				return res.send("Successfully saved!");
			});
		}
	});
});

// Delete a page
router.delete('/page/:id', function(req, res) {
	pageModel.remove({ _id: req.params.id.trim(), 'author._id': req.user._id },
		function(err) { 
			if (err) return res.status(500).send(err);
			res.send("Successfully deleted!");
	});
});

router.get('/logout', function (req, res) {
	req.session.reset();
	res.redirect('/auth');
});

module.exports = router;
