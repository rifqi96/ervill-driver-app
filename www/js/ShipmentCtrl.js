ng_app.controller('ShipmentCtrl', function($rootScope, $scope, $ionicHistory){
	$scope.shipments = [];
	$scope.title = "Daftar Pengiriman";
	$scope.isShipping = false;

	$scope.init = function(){
		if(!$scope.isTokenValid(storage.getItem('user'), storage.getItem('token'))){
			$scope.signout();
		}
		else{
			storage.setItem('prev_route', 'today_shipments');
			$scope.getShipments();
		}
	};

	$scope.$on('returnConfirm', function(evt, args){
		args.then(function(res){
			if(res){
				var params = {
					mode:'list',
					shipment_id:$scope.shipment.id
				};
				$scope.showLoading();
				$scope.startShipment(params);
			}
		});
	});

	$scope.showConfirm = function(shipment){
		storage.setItem('shipment', JSON.stringify(angular.copy(shipment)));
		if(!$scope.isShipping){
				if(shipment.status == 'Draft'){
					if(shipment.isEligible){
						var args = {
							title:'Lakukan Pengiriman',
							template: 'Apakah anda ingin melakukan pengiriman untuk ID#' + shipment.id + '?'
						};

						$rootScope.$broadcast('showConfirm', args);
					}
					else{
						var args = {
							title:'Gagal',
							template: 'Pengiriman ini tidak memiliki pesanan'
						};

						$rootScope.$broadcast('showAlert', args);
					}
				}
				else if(shipment.status == 'Selesai'){
					var args = {
						title:'Gagal',
						template: 'Maaf anda tidak dapat melakukan pengiriman yang sudah selesai'
					};

					$rootScope.$broadcast('showAlert', args);
				}
		}
		else{
			if(shipment.status == "Proses"){
				var params = {
					mode:'list'
				};
				$scope.goToState('orders.list', params);
			}
			else if(shipment.status == 'Draft'){
				var args = {
					title:'Gagal',
					template: 'Anda sedang melakukan pengiriman yang lain'
				};

				$rootScope.$broadcast('showAlert', args);
			}
		}

	};

	$scope.startShipment = function(params){
		var data = {
			keyword:'start-shipment',
			user_id:$scope.user.id,
			token:$scope.token,
			shipment_id:$scope.shipment.id
		};

		var success = function(response){
			var result = response.data;

			if(result.status == 1){
				$scope.goToState('orders.list', params);
			}
			else{
				$scope.signout();
			}
		};

		var fail = function(response){
				alert(JSON.stringify(response));
				$scope.signout();
		};

		return $scope.ajax_request(data, success, fail);
	};

	$scope.$on('scroll.refreshComplete', function(evt, args){
		return $scope.init();
	});

	$scope.getShipments = function(){
		$scope.user = JSON.parse(storage.getItem('user'));
		$scope.token = storage.getItem('token');

		var data = {
			keyword:'today-shipments',
			user_id:$scope.user.id,
			token:$scope.token
		};

		var success = function(response){
			var result = response.data;
			if(result.status == 1){
				$scope.shipments = result.data;

				for(var i in $scope.shipments){
					if($scope.shipments[i].status == "Proses"){
						$scope.isShipping = true;
					}

					if($scope.shipments[i].order_qty < 1){
						$scope.shipments[i].isEligible = false;
					}
					else{
						$scope.shipments[i].isEligible = true;
					}
				}
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
