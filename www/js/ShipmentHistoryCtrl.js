ng_app.controller('ShipmentHistoryCtrl', function($rootScope, $scope, $ionicHistory){
	$scope.shipments = [];
	$scope.title = "History Pengiriman";
	$scope.data = {};

	$scope.init = function(){
		if(!$scope.isTokenValid(storage.getItem('user'), storage.getItem('token'))){
			$scope.signout();
		}
		else{
			storage.setItem('prev_route', 'history');
			if($scope.data.date==undefined){
				$scope.data.date = new Date();
			}
			$scope.getShipments();

		}
	};

	$scope.$on('scroll.refreshComplete', function(evt, args){
		return $scope.init();
	});

	$scope.shipmentDetails = function(shipment){
		storage.setItem('shipment', JSON.stringify(angular.copy(shipment)));
		$scope.goToState('all_orders_history', {
			mode:'history',
			shipment_id:shipment.id
		});
	};

	$scope.getShipments = function(){
		$scope.user = JSON.parse(storage.getItem('user'));
		$scope.token = storage.getItem('token');

		var date = (this.data.date.getMonth()+1) + '/' + this.data.date.getDate() + '/' + this.data.date.getFullYear();

		var data = {
			keyword:'shipments-history',
			user_id:$scope.user.id,
			token:$scope.token,
      date:date
		};

		var success = function(response){
			var result = response.data;
			if(result.status == 1){
				$scope.shipments = result.data;
			}
			else{
				console.log(result.message);
				$scope.signout();
			}
		};
		var fail = function(response){
			alert(JSON.stringify(response));
			$scope.signout();
		};

		return $scope.ajax_request(data,success,fail);
	};
});
