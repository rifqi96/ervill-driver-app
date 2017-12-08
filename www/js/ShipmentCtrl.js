ng_app.controller('ShipmentCtrl', function ($rootScope, $scope, $ionicHistory, FcmService, PusherService){
	$scope.shipments = [];
	$scope.title = "Daftar Pengiriman";
	$scope.isShipping = false;
	$scope.channel = PusherService.pusher.subscribe('shipment-channel');

	$scope.init = function(){
		if(!$scope.isTokenValid(storage.getItem('user'), storage.getItem('token'))){
			$scope.signout();
		}
		else{
			storage.setItem('prev_route', 'today_shipments');
			$scope.getShipments();

			// Pusher real time refresher event //
			$scope.channel.bind('ShipmentUpdated', function (data) {
				if($scope.user.id == data.user.id){
					$scope.doRefresh();
				}
			});

			// Firebase Cloud Messaging Token Store //
			FcmService.messaging.requestPermission()
				.then(function () {
					console.log('Notification permission granted.');
					// TODO(developer): Retrieve an Instance ID token for use with FCM.
					FcmService.messaging.getToken()
						.then(function (currentToken) {
							if (currentToken) {
								// console.log(currentToken);

								if(storage.getItem('fcm_token') == null || storage.getItem('fcm_token') != currentToken) {
									var data = {
										keyword: 'add-fcm-token',
										user_id: $scope.user.id,
										token: $scope.token,
										fcm_token: currentToken
									};

									var success = function(response) {
										var result = response.data;

										if(result.status == 1) {
											storage.setItem('fcm_token', currentToken);
										}
										else{
											$scope.signout();
										}
									};

									var fail = function(response) {
										alert(JSON.stringify(response));
										$scope.signout();
									};

									return $scope.ajax_request(data, success, fail);
								}
							} else {
								// Show permission request.
								console.log('No Instance ID token available. Request permission to generate one.');
								// Show permission UI.
							}
						})
						.catch(function (err) {
							console.log('An error occurred while retrieving token. ', err);
						}
						);

					// Callback fired if Instance ID token is updated.
					FcmService.messaging.onTokenRefresh(function () {
						FcmService.messaging.getToken()
							.then(function (refreshedToken) {
								console.log('Token refreshed.');
								// Indicate that the new Instance ID token has not yet been sent to the
								// app server.
								if (storage.getItem('fcm_token') == null || storage.getItem('fcm_token') != refreshedToken) {
									var data = {
										keyword: 'add-fcm-token',
										user_id: $scope.user.id,
										token: $scope.token,
										fcm_token: refreshedToken
									};

									var success = function (response) {
										var result = response.data;

										if (result.status == 1) {
											storage.setItem('fcm_token', refreshedToken);
										}
										else {
											$scope.signout();
										}
									};

									var fail = function (response) {
										alert(JSON.stringify(response));
										$scope.signout();
									}

									return $scope.ajax_request(data, success, fail);
								}
							})
							.catch(function (err) {
								console.log('Unable to retrieve refreshed token ', err);
							});
					});
				})
				.catch(function (err) {
					console.log('Unable to get permission to notify.', err);
				}
			);
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

						$scope.shipment = JSON.parse(storage.getItem('shipment'));
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
