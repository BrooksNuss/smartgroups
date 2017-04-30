//Angular controller for the admin page

angular.module("mainApp").controller('adminController', function($scope, $stateParams, $rootScope, userAllService, userService, changePasswordService) {
	$scope.teacherList = [];
	$scope.form = {};
	$scope.current = "";
	$scope.newPass = "";

	//Populate database using Angular services
	userAllService.query(function(res){
		$scope.teacherList=res;
	})

	//Update display and currently selected item upon clicking list item
	$scope.setCurrent=function(index) {
		$scope.current=index;
		$scope.form.name=$scope.teacherList[index].fname+" "+$scope.teacherList[index].lname;
		$scope.form.email=$scope.teacherList[index].email;
		$scope.form.username=$scope.teacherList[index].username;
	}

	//Send password reset to database
	$scope.passwordReset = function(){
		$scope.newPass = Math.random().toString(36).slice(-8);
		$scope.teacherList[$scope.current].password=$scope.newPass;
		changePasswordService.update($scope.teacherList[$scope.current]);
		$scope.teacherList = userAllService.query();
	}

	//Delete user
	$scope.delete = function(){
		userService.delete($scope.teacherList[$scope.current]);
		$scope.teacherList.splice($scope.current, 1);
	}

	//Update user
	$scope.update = function(){
		$scope.teacherList[$scope.current].email=form.email;
		userService.update($scope.teacherList[$scope.current]);
	}
});