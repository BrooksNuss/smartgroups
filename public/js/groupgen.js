//Angular controller for group generation page

angular.module("mainApp").controller('groupgenController', function($scope, $stateParams, sidebarData, classService, classTeacherService, studentService, studentArrayService, groupService, groupArrayService, $rootScope, studentByClassService, groupByClassService, studentByGroupService, $q) {
	$scope.groupArr=[];
	$scope.current;
	$scope.form={};
	$scope.studentdb=[];

	$scope.activityTypes=["Reading","Writing","Presenting"];
	$scope.selectTypes=["Random", "By Reading Level", "By Introvert/Extrovert", "Similar Learning Style"];

	//See how many groups are needed based on size
	//have a main generate function. Generate # of groups. Store duplicates of students in temp arr
	//For each student to be added to group, splice them from temp arr after randomly selecting
	//and add them to the necessary group. 

	//Begin generation based on type selected.
	$scope.generate=function() {
		$scope.studentdb=studentByClassService.query({_id: $rootScope.currentClass._id}, function(sdb){
			$scope.studentdb = sdb;
			var temp = $scope.studentdb;
			var numGroups = Math.floor($scope.studentdb.length/$scope.form.size);
			var extra = $scope.studentdb.length%$scope.form.size;

			if($scope.form.selectType=="Random"){
				//randomly pick groups
				for(var i=0;i<numGroups;i++){
					$scope.addGroup(i+1);
					for(var j=0;j<$scope.form.size;j++){
						var currentStudent=$scope.studentdb.splice(Math.floor(Math.random() * ($scope.studentdb.length)), 1);
						$scope.groupArr[i].studentList.push({name: currentStudent[0].name, sid: currentStudent[0]._id});
					};
				};

				//randomly pick groups
				for(var i=0;i<extra;i++){
					var currentStudent=$scope.studentdb.splice(Math.floor(Math.random() * ($scope.studentdb.length)), 1);
					$scope.groupArr[i].studentList.push({name: currentStudent[0].name, sid: currentStudent[0]._id});
				};
			}
			else if($scope.form.selectType=="By Reading Level"){
				$scope.studentdb.sort(function(a, b) {
				    return a.RLevel - b.RLevel;
				});

				for(var i=0;i<numGroups;i++){
					$scope.addGroup(i+1);
					for(var j=0;j<$scope.form.size;j++){
						var currentStudent=$scope.studentdb.splice(0, 1);
						$scope.groupArr[i].studentList.push({name: currentStudent[0].name, sid: currentStudent[0]._id});
					};
				};

				for(var i=extra;i>0;i--){
					var currentStudent=$scope.studentdb.splice(0, 1);
					$scope.groupArr[$scope.groupArr.length-i].studentList.push({name: currentStudent[0].name, sid: currentStudent[0]._id});
				};
			}
			else if($scope.form.selectType=="By Introvert/Extrovert"){
				var extro = [];
				var intro = [];
				for(var i=0;i<$scope.studentdb.length;i++){
					var currentStudent=$scope.studentdb.splice(0, 1);
					i--;
					if(currentStudent[0].PType.charAt(0) == 'E')
							extro.push(currentStudent[0]);
					else
							intro.push(currentStudent[0]);
				}

				for(var i=0;i<numGroups;i++){
					$scope.addGroup(i+1);
						for(var j=0; j<$scope.form.size; j++){
							if(extro.length > 0){
							var currentExtro = extro.splice(0,1);
							$scope.groupArr[i].studentList.push({name: currentExtro[0].name, sid: currentExtro[0]._id});
							}
							else if(intro.length > 0){
							var currentIntro = intro.splice(0,1);
							$scope.groupArr[i].studentList.push({name: currentIntro[0].name, sid: currentIntro[0]._id});	
							}
						}

				}
				for(var i=extra;i>0;i--){
					if(extro.length>0)
						var currentStudent=extro.splice(0, 1);
					else
						var currentStudent=intro.splice(0, 1);

					$scope.groupArr[$scope.groupArr.length-i].studentList.push({name: currentStudent[0].name, sid: currentStudent[0]._id});
				}
			}
			else if($scope.form.selectType=="Similar Learning Style"){
					var vis=[];
					var kin=[];
					var ver=[];
					var aud=[];
					var skipVis = false;
					var skipKin = false;
					var skipVer = false;
					var skipAud = false;

					for(var i=0;i<$scope.studentdb.length;i++){
						var currentStudent=$scope.studentdb.splice(0, 1);
						i--;
						if(currentStudent[0].LType == 'Visual')
							vis.push(currentStudent[0]);
						else if(currentStudent[0].LType == 'Verbal')
							ver.push(currentStudent[0]);
						else if(currentStudent[0].LType == 'Kinesthetic')
							kin.push(currentStudent[0]);
						else
							aud.push(currentStudent[0]);
					}
					console.log("vis: " + vis.length);
					console.log("kin: " + kin.length);
					console.log("ver: " + ver.length);
					console.log("aud: " + aud.length);
					for(var i=0;i<numGroups;i++){
						$scope.addGroup(i+1);
						skipVis=false;
						skipKin=false;
						skipVer=false;
						skipAud=false;
						for(var j=0; j<$scope.form.size; j++){
							if(vis.length > 0 && skipVis==false){
								var currentVis = vis.splice(0,1);
								$scope.groupArr[i].studentList.push({name: currentVis[0].name, sid: currentVis[0]._id});
								skipVis=true;
							}
							else if(kin.length > 0 && skipKin==false){
								var currentKin = kin.splice(0,1);
								$scope.groupArr[i].studentList.push({name: currentKin[0].name, sid: currentKin[0]._id});
								skipKin=true;
							}
							else if(ver.length > 0  && skipVer==false){
								var currentVer = ver.splice(0,1);
								$scope.groupArr[i].studentList.push({name: currentVer[0].name, sid: currentVer[0]._id});
								skipVer=true;
							}
							else if(aud.length > 0 && skipAud==false){
								var currentAud = aud.splice(0,1);
								$scope.groupArr[i].studentList.push({name: currentAud[0].name, sid: currentAud[0]._id});
								skipAud=true;
							}
							if(vis.length==0||skipVis==true && kin.length==0||skipKin==true && ver.length==0||skipVer==true && aud.length==0||skipAud==true)
							{
								skipVis=false;
								skipKin=false;
								skipVer=false;
								skipAud=false;
							}
						}
					}
				}
			//Send groups to database
			groupArrayService.saveAll($scope.groupArr, function(groupResult){
				$scope.groupArr = [];
			});

		});
	}

	//Used by the generate function
	$scope.addGroup=function(nameNum) {
		var newGroup={
		name: $scope.form.name+nameNum,
		size: $scope.form.size,
		class: {cid: $rootScope.currentClass._id, name: $rootScope.currentClass.name},
		activityType: $scope.form.activityType,
		selectType: $scope.form.selectType,
		studentList: []};

		$scope.groupArr.push(newGroup);
	}

	//Used by the generate function
	$scope.startStudentAddSelect=function() {
		$scope.studentdb=studentByClassService.query({_id: $rootScope.currentClass._id});
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
