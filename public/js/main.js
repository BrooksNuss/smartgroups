//Main angular module that constitutes the entire application.

//Include UIRouter and angular resource dependencies
var app = angular.module("mainApp", ["ui.router", "ngResource"]).run(function($rootScope, $http, checkLoginService, $location, $state){
	$rootScope.authenticated = false;
	$rootScope.current_user = "";
	$rootScope.currentClass = {name: "Choose A Class from the Home Menu"};
	$rootScope.validPass=true;
	$rootScope.validMatch=true;
	$rootScope.seatingReset = false; //for seating chart double loading
	$rootScope.currentChart = "";

	//Check to see if user is authenticated
	$rootScope.loggedIn = function()
	{
		checkLoginService.save(function(data)
		{
			if(data.state == 'success')
			{
				$rootScope.authenticated = data.user;
				$rootScope.current_user = data.user;
				$state.go('Home');
			}
			else
			{
				$rootScope.authenticated = data.user;
				$rootScope.current_user = '';
				$state.go('Login');
			}
		});
	};

  	$rootScope.loggedIn();

  	//Called when clicking logout
	$rootScope.signout = function(){
		$rootScope.authenticated = false;
		$rootScope.current_user = "";
		$rootScope.currentClass = {name: "Choose A Class from the Home Menu"};
		$http.get('/auth/signout');
		angular.element(document.querySelectorAll(".refreshCollapse")).removeClass("in");
		//$state.go('Home',{},{reload:true});
		$rootScope.$broadcast('logout');
		$state.go('Login');
	}
});

//Configuration for UI routing
app.config([
	'$stateProvider',
	'$urlRouterProvider',
	'$locationProvider',
	function($stateProvider, $urlRouterProvider, $locationProvider) {
		$stateProvider.state('Home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'homeController'
		});
		$stateProvider.state('Login', {
			url: '/login',
			templateUrl: '/login.html',
			controller: 'authenticationController'
		});
		$stateProvider.state('Signup', {
			url: '/signup',
			templateUrl: '/signup.html',
			controller: 'authenticationController'
		});
		$stateProvider.state('Class List', {
			url: '/classList',
			templateUrl: '/classList.html',
			controller: 'classListController'
		});
		$stateProvider.state('Student List', {
			url: '/studentList',
			templateUrl: '/studentList.html',
			controller: 'studentListController'
		});
		$stateProvider.state('Group List', {
			url: '/groupList',
			templateUrl: '/groupList.html',
			controller: 'groupListController'
		});
		$stateProvider.state('Student Database', {
			url: '/studentdb',
			templateUrl: '/studentdb.html',
			controller: 'studentdbController'
		});
		$stateProvider.state('Class Database', {
			url: '/classdb',
			templateUrl: '/classdb.html',
			controller: 'classdbController'
		});
		$stateProvider.state('Group Generator', {
			url: '/groupgen',
			templateUrl: '/groupgen.html',
			controller: 'groupgenController'
		});
		$stateProvider.state('Seating Charts', {
			url: '/seatingcharts',
			templateUrl: '/seatingcharts.html',
			controller: 'seatingchartsController'
		});
		$stateProvider.state('Seating Chart Creator', {
			url: '/seatingchartcreator',
			templateUrl: '/seatingchartCreator.html',
			controller: 'seatingchartCreatorController'
		});
		$stateProvider.state('Admin', {
			url: '/admin',
			templateUrl: '/admin.html',
			controller: 'adminController'
		});
		$urlRouterProvider.otherwise('Login');
		$locationProvider.html5Mode(true);
}]);

//Service for accessing sidebar data throughout application
app.factory('sidebarData', [function() {
	var sbArr=[
		{text: "Home", active: true, children: []},
		{text: "Classes", active: false, children: [{text: "Class List", active: false},{text: "Class Database", active: false}]},
		{text: "Students", active: false, children: [{text: "Student List", active: false},{text: "Student Database", active: false}]},
		{text: "Groups", active: false, children: [{text: "Group List", active: false},{text: "Group Generator", active: false}]},
		{text: "Seating", active: false, children: [{text: "Seating Charts", active: false},{text: "Seating Chart Creator", active: false}]}];

	return sbArr;
}]);

//Service for accessing current user's class list
app.factory('classListData', function(classTeacherService, $rootScope) {
	return classTeacherService.query({teacher: $rootScope.current_user.username});
})

//Angular controller for the sidebar and other nav elements
app.controller("sidebarController", function($scope, $state, $timeout, sidebarData, $rootScope, userService, changePasswordService) {		
	$scope.sidebarArr=sidebarData;
	$scope.stateName=$state;

	//Reset all sidebar elements to deactivated
	$scope.deActivateAll=function() {
		for(var i=0;i<$scope.sidebarArr.length;i++) {
			$scope.sidebarArr[i].active=false;
			for(var j=0;j<$scope.sidebarArr[i].children.length;j++) {
				$scope.sidebarArr[i].children[j].active=false;
			}
		}
	};

	//For choosing a child sidebar element
	$scope.setActiveChild=function(child) {
		$scope.deActivateAll();
		child.active=true;
		if(child.text==="Seating Chart Creator")
			$state.go(child.text);
		else
			$state.go(child.text,{},{reload:true});
	};

	//For choosing a parent sidebar element
	$scope.setActiveParent=function(parent) {
		if(parent.children.length==0) {
			$scope.deActivateAll();
			parent.active=true;
			$state.go(parent.text,{},{reload:true});
		}
	};

	//On logout, reset all sidebar elements
	$scope.$on('logout', function(){
		$scope.deActivateAll();
	})

	//Go to home page
	$rootScope.homeBtn=function(){
		$state.go("Home");
	};

	//Go to classes page
	$rootScope.classesBtn=function(){
		var parent=document.getElementById('Classes-sidebar-button');
		if(!parent.getAttribute("aria-expanded")){
			$timeout(function(){
				parent.click();
			}, 0);
		}
		var parentAng=$scope.sidebarArr[1];
		$scope.setActiveParent(parentAng);
		$scope.setActiveChild(parentAng.children[0]);
	};

	//Go to students page
	$rootScope.studentsBtn=function(){
		var parent=document.getElementById('Students-sidebar-button');
		if(!parent.getAttribute("aria-expanded")){
			$timeout(function(){
				parent.click();
			}, 0);
		}
		var parentAng=$scope.sidebarArr[2];
		$scope.setActiveParent(parentAng);
		$scope.setActiveChild(parentAng.children[0]);
	};

	//Go to groups page
	$rootScope.groupsBtn=function(){
		var parent=document.getElementById('Groups-sidebar-button');
		if(!parent.getAttribute("aria-expanded")){
			$timeout(function(){
				parent.click();
			}, 0);
		}
		var parentAng=$scope.sidebarArr[3];
		$scope.setActiveParent(parentAng);
		$scope.setActiveChild(parentAng.children[0]);
	};

	//Go to admin page
	$rootScope.adminBtn=function(){
		$scope.setActiveParent($scope.sidebarArr[0]);
		$state.go('Admin',{},{reload:true});
	}

	$rootScope.accountForm={};

	//Populate account page with user info
	$rootScope.openAccount=function() {
		$rootScope.accountForm.fname=$rootScope.current_user.fname;
		$rootScope.accountForm.lname=$rootScope.current_user.lname;
		$rootScope.accountForm.email=$rootScope.current_user.email;
		$rootScope.accountForm.username=$rootScope.current_user.username;
		$rootScope.accountForm.fname=$rootScope.current_user.fname;
	}

	//Update from account page
	$rootScope.updateAccount=function(c) {
		$rootScope.current_user.fname=c.fname;
		$rootScope.current_user.lname=c.lname;
		$rootScope.current_user.email=c.email;
		userService.update($rootScope.current_user);
	}

	//Test password against regex
	$rootScope.isPassValid = function(){
		let passTest = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

		if(passTest.test($rootScope.accountForm.password)){
			$rootScope.validPass=true
		}
		else
			$rootScope.validPass=false;

		if($rootScope.validPass){
			if($rootScope.accountForm.password===$rootScope.accountForm.passMatch){
				$rootScope.validMatch=true;
				return true;
			}
			else
				$rootScope.validMatch=false;
		}
	}

	//Change password from account page
	$rootScope.changePass=function() {
		if($scope.isPassValid()){
			$rootScope.current_user.password=$rootScope.accountForm.password;
			changePasswordService.update($rootScope.current_user, function(res){
				$rootScope.current_user=res;
			});
		}
	}
});

//The following angular services are used to make HTTP calls to the server.
//Primarily used to access various API endpoints for database connectivity
app.factory('studentService', function($resource){
	return $resource('/api/studentList/:_id', { _id: '@_id' },
    {
        'update': { method:'PUT' }
    });
});

app.factory('studentArrayService', function($resource){
	return $resource('/api/studentList/array', {},
    {
        'saveAll': { method:'POST', isArray:true}
    });
});

app.factory('studentByClassService', function($resource){
	return $resource('/api/studentList/class/:_id', { _id: '@_id' },
    {
        'update': { method:'PUT' }
    });
});

app.factory('studentByGroupService', function($resource){
	return $resource('/api/studentList/group/:group', {},
    {
        'update': { method:'PUT' }
    });
});

app.factory('classService', function($resource){
	return $resource('/api/classList/:_id', { _id: '@_id' },
    {
        'update': { method:'PUT' }
    });
});

app.factory('classTeacherService', function($resource){
	return $resource('/api/classList/teacher/:teacher', {},
    {
        'update': { method:'PUT' }
    });
});

app.factory('groupService', function($resource){
	return $resource('/api/groupList/:_id', { _id: '@_id' },
    {
        'update': { method:'PUT' }
    });
});

app.factory('groupArrayService', function($resource){
	return $resource('/api/groupList/array', {},
    {
        'saveAll': { method:'POST', isArray:true}
    });
});

app.factory('groupByClassService', function($resource){
	return $resource('/api/groupList/class/:class', {},
    {
        'update': { method:'PUT' }
    });
});

app.factory('loginService', function($resource){
	return $resource('/auth/login/:id', { _id: '@_id' },
    {
        'update': { method:'PUT' }
    });
});

app.factory('signupService', function($resource){
	return $resource('/auth/signup/:id', { _id: '@_id' },
    {
        'update': { method:'PUT' }
    });
});

app.factory('checkLoginService', function($resource){
	return $resource('/auth/isLoggedIn/:id', { _id: '@_id' },
    {
        'update': { method:'PUT' }
    });
});

app.factory('checkUserAvailService', function($resource){
	return $resource('/api/users/:username', { username: '@username' },
    {
        'update': { method:'PUT' }
    });
});

app.factory('userService', function($resource){
	return $resource('/api/users/:_id', { _id: '@_id' },
    {
        'update': { method:'PUT' }
    });
});

app.factory('userAllService', function($resource){
	return $resource('/api/users/', {},
    {
        'update': { method:'PUT' }
    });
});

app.factory('changePasswordService', function($resource){
	return $resource('/api/users/password/:_id', { _id: '@_id' },
    {
        'update': { method:'PUT' }
    });
});

app.factory('seatingchartService', function($resource){
	return $resource('/api/seatingcharts/:_id', { _id: '@_id' },
    {
        'update': { method:'PUT' }
    });
});

app.factory('seatingchartAllService', function($resource){
	return $resource('/api/seatingcharts/', { _id: '@_id' },
    {
        'update': { method:'PUT' }
    });
});

app.factory('seatingchartByClassService', function($resource){
	return $resource('/api/seatingcharts/class/:_id', { _id: '@_id' },
    {
        'update': { method:'PUT' }
    });
});