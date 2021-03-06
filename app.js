var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require('./models/user');

var index = require('./routes/index');
var admin = require('./routes/admin');

var app = express();
var session = require('client-sessions');

// setup mongo database
mongoose.connect('mongodb://localhost/portalCMS');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to portalCMS!');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session handling
app.use(session({
  cookieName: 'session', // Names the request object req.session
  secret: 'xqKBPWdJvjbC9zRi3m6T',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));
app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    User.findById(req.session.user._id, function(err, user) {
      if (user) {
        req.user = user.toObject(); // Convert from mongoose object to JS
        delete req.user.password;
        req.session.user = user; // Refreshes the cookie header
        res.locals.user = user; // Local to views
      }
      next();
    });
  } else {
    next();
  }
});

/* Define require login function */
function requireLogin (req, res, next) {
	if (!req.user) {
	  res.redirect('/auth');
	} else {
	  next();
	}
};

app.use('/admin', admin);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
