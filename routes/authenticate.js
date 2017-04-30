//Authentication endpoints for login/signup.

var express = require('express');
var router = express.Router();

module.exports = function(passport){

	//sends successful login state back to angular
	router.get('/success', function(req, res){
		res.json({state: 'success', user: req.user ? req.user : null});
	});

	//sends failure login state back to angular
	router.get('/failure', function(req, res){
		//Once req.flash is called once, it seems to become undefined. Therefore, only call it once here v
		res.send({state: 'failure', user: null, message: req.flash('failureMessage')[0]});
	});

	//sends failure login state back to angular
	router.get('/regfailure', function(req, res){
		res.send({state: 'failure', user: null});
	});	

	//log in
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failure',
		failureFlash : true
	}));

	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/regfailure',
		failureFlash: true
	}));

	//log out
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});

	//is logged in
	router.post('/isloggedin', function(req, res){
	    if(req.isAuthenticated())
	    {
	        res.send({state: 'success', user: req.user});
	    }
	    else
	    {
	        res.send({state: 'failure', user: null});
	    }
	});

	return router;

}