(function () {
	'use strict';
	var app = angular.module('LunchCheck',[]);
	app.controller('LunchCheckController', LunchCheckController);
	LunchCheckController.$inject = ['$scope'];
	function LunchCheckController ($scope) {
		$scope.list = '';
		$scope.msg = '';
		$scope.fontStyle = {};
		$scope.boxStyle = {};

		$scope.checkItems = function () {
			console.log ('check Items');
			console.log ($scope.list);
			if ($scope.list !== '') {
				var arr = $scope.list.split(',');
				var count = 0;
				for (var i = 0; i < arr.length; i++){
					if (arr[i].trim() !== '') {
						count++;
					}
				}
				
				if (count > 0) {
					if (count <= 3) {
						$scope.msg = 'Enjoy!';
					}
					else if(count > 3) {
						$scope.msg = 'Too much!'
					}
					$scope.fontStyle = {
						"color":"green"
					};
					$scope.boxStyle = {
						"border-color":"green"
					};
				}
				else {
					enterItems();
				}
			}
			else {
				enterItems();
			}
		}
		var enterItems = function() {
			$scope.msg = 'Please enter your data';
				$scope.fontStyle = {
					"color":"red"
				};
				$scope.boxStyle = {
					"border-color":"red"
				};
		};
	}
})();