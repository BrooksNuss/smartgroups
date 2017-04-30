//Basic redirection for accessing application
//This version of the file is for remote hosting on Microsoft Azure
//because their filesystem is structured differently.

var express = require('express');
var router = express.Router();

function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect to the login page
	return res.redirect('/login');
};

router.use('/studentList', isAuthenticated);
router.use('/classList', isAuthenticated);
router.use('/groupList', isAuthenticated);
router.use('/home', isAuthenticated);


/* GET home page. */
router.route('/')
	.get(function(req, res) {
		res.sendFile("main.html", {"root": "../public"});
	});

router.route('/login')
	.get(function(req, res) {
		res.sendFile("main.html", {"root": "../public"});
	});

router.route('/signup')
	.get(function(req, res) {
		res.sendFile("main.html", {"root": "../public"});
	});

router.route('/studentList')
	.get(function(req, res) {
		res.sendFile("main.html", {"root": "../public"});
	});

router.route('/home')
	.get(function(req, res) {
		res.sendFile("main.html", {"root": "../public"});
	});

router.route('/classList')
	.get(function(req, res) {
		res.sendFile("main.html", {"root": "../public"});
	});

router.route('/groupList')
	.get(function(req, res) {
		res.sendFile("main.html", {"root": "../public"});
	});

module.exports = router;