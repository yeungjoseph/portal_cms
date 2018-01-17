var express = require('express');
var router = express.Router();

/* Set admin routes */
router.get('/', function (req, res) {
	res.render('dashboard', {});
});

router.get('/editadmin', function (req, res) {
	res.render('editadmin', {});
});

router.get('/editpage', function (req, res) {
	res.render('editpage', {});
});

module.exports = router;


