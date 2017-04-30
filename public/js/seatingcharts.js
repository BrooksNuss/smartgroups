//Angular controller for seating charts page

angular.module("mainApp").controller('seatingchartsController', function($scope, $stateParams, studentService, $rootScope, studentByClassService, seatingchartService, seatingchartAllService, seatingchartByClassService) {
	$scope.chartArr = [];
    $scope.current = "";
    $scope.form = {};

    //Check for selected class
    if($rootScope.currentClass._id){
        seatingchartByClassService.query({_id: $rootScope.currentClass._id}, function(res){
            $scope.chartArr = res;
        })
    }
    else
        $scope.studentArr.push({name: "Please select a class first."});

    $scope.setCurrent=function(index) {
        $scope.current=index;
        $rootScope.currentChart = $scope.chartArr[$scope.current];
    }

    $scope.addChart = function(){
        var newChart={
            name: "New Chart",
            data: [],
            class: $rootScope.currentClass._id
        };
        $scope.chartArr.push(newChart);
        seatingchartAllService.save(newChart);
        $scope.chartArr = seatingchartByClassService.query({_id: $rootScope.currentClass._id});
    }

    $scope.removeChart = function(){
        seatingchartService.delete({_id: $scope.chartArr[$scope.current]._id});
        $scope.chartArr.splice($scope.current, 1);
    }

    $scope.updateChart = function(){
        $scope.chartArr[$scope.current].name = $scope.form.name;
        seatingchartService.update($scope.chartArr[$scope.current]);
    }
});