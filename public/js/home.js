//Angular controller for home page

angular.module("mainApp").controller("homeController", function($scope, classTeacherService, $rootScope, classService) {
	$scope.classList= classTeacherService.query({teacher: $rootScope.current_user.username});

	if($rootScope.currentClass){
		angular.forEach($rootScope.currentClass.studentList, function(student){
			student.selected=false;
		});
	}


	$scope.setCurrent=function(index) {
		$rootScope.currentClass=$scope.classList[index];
		angular.forEach($rootScope.currentClass.studentList, function(student){
			student.selected=false;
		})
	}

	//Calculate number of elegible students for selection in class
	$scope.eligible=function() {
		var count=0;
		angular.forEach($rootScope.currentClass.studentList, function(student) {
			count+=student.done ? 0 : 1;
		});
		return count;
	};

	//Complete activities for selected students
	$scope.complete=function() {
		angular.forEach($rootScope.currentClass.studentList, function(student) {
			if(student.selected) {
				student.done=true;
				student.selected=false;
			}
		});
		classService.update($rootScope.currentClass);
	};

	//Reset all students to incomplete
	$scope.reset=function() {
		angular.forEach($rootScope.currentClass.studentList, function(student) {
			student.done=false;
			student.selected=false;
		});
		classService.update($rootScope.currentClass);
	};

	//Select a random, non completed student
	$scope.selectRandom=function() {
		var tempArr=[];
		angular.forEach($rootScope.currentClass.studentList, function(student) {
			if (!student.done && !student.selected)
				tempArr.push(student);
		});
		if (tempArr.length>0)
			tempArr[Math.floor(Math.random() * (tempArr.length))].selected=true;
	};
})