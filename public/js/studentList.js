angular.module("mainApp").controller('studentListController', function($scope, $stateParams, studentService, $rootScope, studentByClassService) {
	$scope.studentArr=[];
	$scope.current;
	$scope.form={};
	$scope.readingLevels=["",1,2,3,4,5,6,7,8,9,10,11,12];
	$scope.learningTypes=["Auditory","Kinesthetic","Visual","Verbal"];
	$scope.personalityTypes=["ISTJ", "ISFJ", "INFJ", "INTJ", "ISTP", "ISFP", "INFP", "INTP", "ESTP", "ESFP", "ENFP", "ENTP", "ESTJ", "ESFJ", "ENFJ", "ENTJ"];

	if($rootScope.currentClass._id)
		$scope.studentArr = studentByClassService.query({_id: $rootScope.currentClass._id});
	else
		$scope.studentArr.push({name: "Please select a class first."});

	$scope.setCurrent=function(index) {
		$scope.current=index;
		$scope.form.name=$scope.studentArr[index].name;
		$scope.form.LType=$scope.studentArr[index].LType;
		$scope.form.PType=$scope.studentArr[index].PType;
		$scope.form.RLevel=$scope.studentArr[index].RLevel;
	}

	$scope.update=function(student) {
		$scope.studentArr[$scope.current].name=student.name;
		$scope.studentArr[$scope.current].LType=student.LType;
		$scope.studentArr[$scope.current].PType=student.PType;
		$scope.studentArr[$scope.current].RLevel=student.RLevel;
		studentService.update($scope.studentArr[$scope.current]);
	}

	$scope.$on('logout', function(){
		$scope.studentArr=[];
		$scope.current=0;
		$scope.form={};
		
		$scope.studentArr = studentService.query();
	})
});
