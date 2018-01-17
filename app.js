let express = 	require('express');
let path    =	require('path');
let ejs	    =	require('ejs');

let app = express();

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set up folder to serve static files
app.use(express.static('public'));


// Set up routes
app.get('/', function (req, res) {
	res.send('hello world');
});

app.get('/template', function (req, res) {
	res.render('template',{
		title: "Template Title",
		content: "Template content here."
	});
});

app.get('/admin', function (req, res) {
	res.render('admin', {});
});

app.get('/dashboard', function (req, res) {
	res.render('dashboard', {});
});

app.get('/editadmin', function (req, res) {
	res.render('editadmin', {});
});

app.get('/editpage', function (req, res) {
	res.render('editpage', {});
});


// Start listening on port 3000
app.listen(3000, () => console.log('Example app listening on port 3000!'));
