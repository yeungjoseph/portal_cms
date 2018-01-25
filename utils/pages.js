var pageModel = require('../models/page');

var queryPages = function (req, res, next) {
	pageModel.find({ "visible": true }, function (err, pages) {
		if (err) return res.send(err);
		res.locals.pages = pages;
		next();
    });
};

module.exports = {
    queryPages
}