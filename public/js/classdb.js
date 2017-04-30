//Angular controller for class database page.

angular.module("mainApp").controller('classdbController', function($scope, $stateParams, classService, classTeacherService, studentService, $rootScope, studentByClassService) {
	$scope.classArr=[];
	$scope.current;
	$scope.form={};

	$scope.studentdb=[];
	$scope.studentArr=[];
	$scope.groupArr=[];
	$scope.tempArr=[];
	$scope.addSuccess= true;
	$scope.addComplete= false;
	$scope.removeSuccess= true;
	$scope.removeComplete= false;

	$scope.classArr = classService.query();

	//Add new class locally and to database
	$scope.addClass=function() {
		var newClass={name: "New Class",
			teacher: $scope.current_user.username,
			studentList: [],
			groupList: []};
		$scope.classArr.push(newClass);
		classService.save(newClass);
		//Re-retrieve after posting to database to aquire newly generated _id
		$scope.classArr = classTeacherService.query({teacher: $rootScope.current_user.username});
	}

	//Remove class locally and from the database
	$scope.removeClass=function() {
		if($scope.classArr[$scope.current].studentList.length==0){
			classService.delete($scope.classArr[$scope.current], function(result){
				if(!result.status){
					console.log(result.reason);
				}
			});
			$scope.classArr.splice($scope.current, 1);
			$rootScope.currentClass=null;
			$rootScope.currentClass = {name: "please choose a class from the home menu"};
		}
	}

	$scope.setCurrent=function(index) {
		$scope.current=index;
		$scope.form.name=$scope.classArr[index].name;
		$scope.form.teacher=$scope.classArr[index].teacher;
		$scope.form.studentArr=$scope.classArr[index].studentArr;
		$scope.form.groupArr=$scope.classArr[index].groupArr;
	}

	//Upon logging out, reset these parameters for the next user
	$scope.$on('logout', function(){
		$scope.classArr=[];
		$scope.current="";
		$scope.form={};

		$scope.studentArr=[];
		$scope.groupArr=[];
		$scope.tempArr=[];
	})
});
