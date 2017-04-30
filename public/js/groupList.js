//Angular controller for group list page

angular.module("mainApp").controller('groupListController', function($scope, $stateParams, classService, studentService, groupService, $rootScope, studentByClassService, groupByClassService, studentByGroupService) {
	$scope.groupArr=[];
	$scope.current;
	$scope.form={};
	$scope.studentdb=[];

	$scope.tempArr=[];
	$scope.addSuccess= true;
	$scope.addComplete= false;
	$scope.removeSuccess= true;
	$scope.removeComplete= false;

	$scope.activityTypes=["Reading","Writing","Presenting"];
	$scope.selectTypes=["Random", "One of each", "By Reading Level"];

	//Checking to see if a class has been selected
	if($rootScope.currentClass._id)
		$scope.groupArr = groupByClassService.query({class: $rootScope.currentClass._id});
	else
		$scope.groupArr.push({name: "Please select a class first."});

	$scope.addGroup=function() {
		if($rootScope.currentClass._id){
			var newGroup={
			name: "New Group",
			size: 5,
			class: {cid: $rootScope.currentClass._id, name: $rootScope.currentClass.name},
			activityType: "",
			selectType: "",
			studentList: []};

			$scope.groupArr.push(newGroup);
			groupService.save(newGroup);
			$scope.groupArr = groupByClassService.query({class: $rootScope.currentClass._id}, function(result){
				$rootScope.currentClass.groupList.push({gid: result[0]._id, name: result[0].name});
				classService.update($rootScope.currentClass);
			});
		}
	}

	$scope.removeGroup=function() {
		groupService.delete($scope.groupArr[$scope.current]);
		$scope.groupArr.splice($scope.current, 1);
		$rootScope.currentClass.groupList.splice($scope.current, 1);
	}

	$scope.setCurrent=function(index) {
		$scope.current=index;
		$scope.form.name=$scope.groupArr[index].name;
		$scope.form.size=$scope.groupArr[index].size;
		$scope.form.activityType=$scope.groupArr[index].activityType;
		$scope.form.selectType=$scope.groupArr[index].selectType;
		$scope.form.studentList=$scope.groupArr[index].studentList;
	}

	$scope.update=function(g) {
		$scope.groupArr[$scope.current].name=g.name;
		$scope.groupArr[$scope.current].size=g.size;
		$scope.groupArr[$scope.current].studentArr=g.studentArr;
		$scope.groupArr[$scope.current].activityType=g.activityType;
		$scope.groupArr[$scope.current].selectType=g.selectType;
		groupService.update($scope.groupArr[$scope.current]);
	}

	$scope.startStudentAddSelect=function() {
		$scope.studentdb=studentByClassService.query({_id: $rootScope.currentClass._id});
		angular.forEach($scope.studentdb, function(student) {
			student.selected = false;
		})
	}

	$scope.startStudentRemoveSelect=function() {
		$scope.studentdb = studentByGroupService.query({group: $scope.groupArr[$scope.current]._id});
		angular.forEach($scope.studentdb, function(student){
			student.selected = false;
		})
	}

	$scope.toggleStudentSelect=function(index) {
		$scope.studentdb[index].selected = !$scope.studentdb[index].selected;
	}

	//Add student to group
	$scope.addToGroup=function() {
		angular.forEach($scope.studentdb, function(student){ 
			if (student.selected){
				//check if class already has those students
				//groups' students = elem
				var err=false;
				var transaction=true;
				if (!$scope.groupArr[$scope.current].studentList.some(function(elem){return elem.sid===student._id;})){
					//push new groups to local selected student
					$scope.groupArr[$scope.current].studentList.push({
						sid: student._id,
						name:student.name,
					});
				}
				else err=true;
				//check if these students are registered in this class
				//students' groups=elem
				if (!err && !student.groups.some(
					function(elem){
					return elem.gid===$scope.groupArr[$scope.current]._id;})){
					//push this class to student
					student.groups.push({
						gid: $scope.groupArr[$scope.current]._id,
						name:$scope.groupArr[$scope.current].name
					});
					transaction=true;
				}
				else{
					transaction=false;
					$scope.finishAdd(false);
				}
				//update remote selected student with new groups
				if(transaction)
					studentService.update(student);
			}
		});
		//update remote groups with new added student
		groupService.update($scope.groupArr[$scope.current]);
	}

	//Remove student from group
	$scope.removeFromGroup=function() {
		angular.forEach($scope.studentdb, function(student){ 
			if (student.selected){
				//remove students from studentList
				//groups' students = elem
				//So, make a map from currentClass's studentList consisting of the
				//sid's. Remove the elements from studentList where map.sid == selected
				//students' _id
				$scope.groupArr[$scope.current].studentList.splice(
					$scope.groupArr[$scope.current].studentList.map(function(e) {
						return e.sid; }).indexOf(student._id), 1);
				//students' groups=elem
				//remove this group from student, if applicable
				student.groups.splice(student.groups.map(function(e) {
					return e.gid; }).indexOf($scope.groupArr[$scope.current]._id), 1);
				//remove should always work, so no need to return any errors here, just always finish true.
				$scope.finishRemove(true);
			}
			//update remote student with removed groups
			studentService.update(student);
		});
		//update remote group with removed students
		groupService.update($scope.groupArr[$scope.current]);
	}

	$scope.finishAdd=function(status){
		$scope.addSuccess=status;
		$scope.addComplete=true;
	}

	$scope.closeAdd=function(){
		$scope.addComplete=false;
		$scope.addSuccess=true;
		angular.forEach($scope.studentdb, function(student){ 
			student.selected=false;
		});
	}

	$scope.finishRemove=function(status){
		$scope.removeSuccess=status;
		$scope.removeComplete=true;
	}

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
