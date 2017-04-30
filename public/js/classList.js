//Angular controller for the class list page

angular.module("mainApp").controller('classListController', function($scope, $stateParams, classService, classTeacherService, studentService, $rootScope, studentByClassService) {
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
	$scope.selected = 0;

	$scope.activityTypes=["Reading","Writing","Presenting"];
	$scope.selectionTypes=["Random", "By Reading Level"];

	$scope.classArr = classTeacherService.query({teacher: $rootScope.current_user.username});


	$scope.addClass=function() {
		var newClass={name: "New Class",
		teacher: $scope.current_user.username,
		studentList: [],
		groupList: []};
		$scope.classArr.push(newClass);
		classService.save(newClass);
		$scope.classArr = classTeacherService.query({teacher: $rootScope.current_user.username});
	}

	$scope.removeClass=function() {
		classService.delete($scope.classArr[$scope.current]);
		$scope.classArr.splice($scope.current, 1);
	}

	$scope.setCurrent=function(index) {
		$scope.selected=1;
		$scope.current=index;
		$scope.form.name=$scope.classArr[index].name;
		$scope.form.teacher=$scope.classArr[index].teacher;
		$scope.form.studentArr=$scope.classArr[index].studentArr;
		$scope.form.groupArr=$scope.classArr[index].groupArr;
	}

	//Update current selected class locally and in database.
	$scope.update=function(c) {
		$scope.classArr[$scope.current].name=c.name;
		$scope.classArr[$scope.current].teacher=c.teacher;
		$scope.classArr[$scope.current].studentArr=c.studentArr;
		$scope.classArr[$scope.current].groupArr=c.groupArr;
		classService.update($scope.classArr[$scope.current], function(result){
			if(result._id){
				if($rootScope.currentClass._id==result._id){
					$rootScope.currentClass=result;
				}
			}
		});
	}

	//Runs when clicking the add student button. Gets list of possible students from database
	$scope.startStudentAddSelect=function() {
		$scope.studentdb=studentService.query();
		angular.forEach($scope.studentdb, function(student) {
			student.selected = false;
		})
	}

	//Same as above, but for removing students
	$scope.startStudentRemoveSelect=function() {
		$scope.studentdb = studentByClassService.query({_id: $scope.classArr[$scope.current]._id});
		angular.forEach($scope.studentdb, function(student){
			student.selected = false;
		})
	}

	//In add/remove menus, set student active/inactive on click
	$scope.toggleStudentSelect=function(index) {
		$scope.studentdb[index].selected = !$scope.studentdb[index].selected;
	}

	//After all students have been selected for adding, and add is clicked, begin this finalization process
	$scope.addToClass=function() {
		angular.forEach($scope.studentdb, function(student){ 
			if (student.selected){
				//check if class already has those students
				//classes' students = elem
				var err=false;
				var transaction=true;
				if (!$scope.classArr[$scope.current].studentList.some(function(elem){return elem.sid===student._id;})){
					//push new classes to local selected student
					$scope.classArr[$scope.current].studentList.push({
						sid: student._id,
						name:student.name,
						done: false
					});
				}
				else err=true;
				//check if these students are registered in this class
				//students' classes=elem
				if (!err && !student.classes.some(
					function(elem){
					return elem.cid===$scope.classArr[$scope.current]._id;})){
					//push this class to student
					student.classes.push({
						cid: $scope.classArr[$scope.current]._id,
						name:$scope.classArr[$scope.current].name
					});
					transaction=true;
				}
				else{
					transaction=false;
					$scope.finishAdd(false);
				}
				//update remote selected student with new classes
				if(transaction)
					studentService.update(student);
			}
		});
		//update remote classes with new added student
		console.log("WE MADE IT");
		classService.update($scope.classArr[$scope.current]);
	}

	//Same as above, but for removing students
	$scope.removeFromClass=function() {
		angular.forEach($scope.studentdb, function(student){ 
			if (student.selected){
				//remove students from studentList
				//classes' students = elem
				var err=false;
				//remove student from current class
				//So, make a map from currentClass's studentList consisting of the
				//sid's. Remove the elements from studentList where map.sid == selected
				//students' _id
				$scope.classArr[$scope.current].studentList.splice(
					$scope.classArr[$scope.current].studentList.map(function(e) {
						return e.sid; }).indexOf(student._id), 1);
				//students' classes=elem
					//remove this class from student, if applicable
				student.classes.splice(student.classes.map(function(e) {
					return e.cid; }).indexOf($scope.classArr[$scope.current]), 1);
				//remove should always work, so no need to return any errors here, just always finish true.
				$scope.finishRemove(true);
			}
			//update remote student with removed classes
			studentService.update(student);
		});
		//update remote class with removed students
		classService.update($scope.classArr[$scope.current]);
	}

	//Update messages after adding
	$scope.finishAdd=function(status){
		$scope.addSuccess=status;
		$scope.addComplete=true;
	}

	//Upon closing add modal
	$scope.closeAdd=function(){
		$scope.addComplete=false;
		$scope.addSuccess=true;
		angular.forEach($scope.studentdb, function(student){ 
			student.selected=false;
		});
	}

	//Same as above, but for remove
	$scope.finishRemove=function(status){
		$scope.removeSuccess=status;
		$scope.removeComplete=true;
	}
	
	//Same as above, but for remove
	$scope.closeRemove=function(){
		$scope.removeComplete=false;
		$scope.removeSuccess=true;
		angular.forEach($scope.studentdb, function(student){ 
			student.selected=false;
		});
	}

	$scope.$on('logout', function(){
		$scope.classArr=[];
		$scope.current=0;
		$scope.form={};

		$scope.studentArr=[];
		$scope.groupArr=[];
		$scope.tempArr=[];
	})
});
