//Angular controller for login and signup pages

angular.module('mainApp').controller("authenticationController", function($scope, $rootScope, $state, loginService, signupService, checkUserAvailService, userService) {
	$scope.user = {username: '', password: ''};
	$scope.error_message = '';

	$scope.regFName="";
	$scope.regLName="";
	$scope.regEmail="";
	$scope.regUser={username: "temp", regUser: ""};
	$scope.regPass="";
	$scope.regPass2="";

	$scope.validEmail=true;
	$scope.validUser=true;
	$scope.availUser=true;
	$scope.validPass=true;
	$scope.validMatch=true;

	$scope.validLogin=true;

	//Check email format by regex
	$scope.isEmailValid = function() {
			var emailTest = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(emailTest.test($scope.regEmail)== true) 
			{
				$scope.validEmail = true;
			}
			else
				$scope.validEmail=false
	};

	//Check password format using regex
	$scope.isPassValid = function(){
		let passTest = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

		if(passTest.test($scope.regPass)){
			$scope.validPass=true
		}
		else
			$scope.validPass=false;

		if($scope.validPass){
			if($scope.regPass===$scope.regPass2)
				$scope.validMatch=true;
			else
				$scope.validMatch=false;
		}
	};

	//Start login process. 
	$scope.login = function(username, password){
		$scope.user.username=username;
		$scope.user.password=password;
    	loginService.save($scope.user, function(data){
    		if(data.state == 'success'){
	    			$rootScope.authenticated = data.user;
		    		$rootScope.current_user = data.user;
		    		$state.go('Home');
    		}
    		else{
    			$scope.validLogin = false;
    		}
    	})
  	};

  	//Go to registration page. If no user exists, an admin login will be
  	//created and logged in.
  	$scope.beginRegister = function(){
  		$state.go('Signup');
  		userService.query({}, function(res){
  			//if no users exist, create admin account
  			if(res.length===0){
  				$state.go('Login');
  				var admin={
		  			type: "admin",
		  			fname: "Brooks",
					lname: "Nuss",
					email: "",
					username: "admin",
					password: "adminTemp",
					phone: "",
					vehicles: [],
					cart: []
	  			};
	  			signupService.save(admin, function(data){
	  				$scope.login('admin', 'adminTemp');
	  			});
  			}
  		});
  	}

  	//Go to login page
  	$scope.beginLogin = function(){
  		$state.go('Login');
  	}

  	//Check user availability
  	$scope.isUserAvailable = function(){
  		checkUserAvailService.get({username: $scope.regUser.regUser}, function(res){
  			$scope.availUser=res;
  		});
  	}

  	//Called when clicking register
  	$scope.register = function(){
  		$scope.user={
  			type: "user",
  			fname: $scope.regFName,
			lname: $scope.regLName,
			email: $scope.regEmail,
			username: $scope.regUser.regUser,
			password: $scope.regPass,
  		};
    	signupService.save($scope.user, function(data){
    		if(data.state == 'success'){
	    			$rootScope.authenticated = data.user;
		    		$rootScope.current_user = data.user;
		    		$state.go('Home');
   			}
    		else{
    			$scope.error_message = data.message;
    		}
    	})
  	};
});