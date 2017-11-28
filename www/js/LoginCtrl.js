ng_app.controller('LoginCtrl', function($rootScope, $scope, $http){
  $scope.button_text = "Masuk";
	$scope.button_icon = "icon-left ion-person";
	$scope.isClicked = "";
	$scope.init = function(){
		if($scope.isTokenValid(storage.getItem('user'), storage.getItem('token'))){
			$scope.goToState('shipments');
		}
		else{
			$scope.signout();
		}
	};
  $scope.doLogin = function(){
		$scope.isClicked = "checked";
		$scope.button_icon = "icon-left ion-load-c ion-spin-animation";
    $scope.button_text = "Mohon tunggu";
    $scope.showLoading();
		var data = {
			keyword:"login",
			username:this.username,
			password:this.password
		};
    var success = function(response){
			var result = response.data;
			$scope.button_text = "Masuk";
			$scope.isClicked = "";
			$scope.button_icon = "icon-left ion-person";
      if(result.status == 1){
				storage.setItem("user", JSON.stringify(result.data.user));
				storage.setItem("token", result.data.token);
				$scope.goToState('shipments');
        $scope.hideLoading();
			}
			else{
				$scope.signout();
        $rootScope.$broadcast('showAlert', {
          title:'Gagal',
          template:result.message
        });
			}
    };
    var fail = function(response){
			$scope.button_text = "Masuk";
			$scope.isClicked = "";
			$scope.button_icon = "icon-left ion-person";
      alert(JSON.stringify(response));
			$scope.signout();
    };
     return $scope.ajax_request(data,success,fail);
  };
});
