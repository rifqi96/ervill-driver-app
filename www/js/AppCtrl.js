ng_app.controller('AppCtrl', function($scope, $http, $rootScope, $window, $ionicSideMenuDelegate, $timeout, $state, $ionicLoading, ionicMaterialInk, $ionicHistory, $ionicViewSwitcher){
    $scope.user = {};
    $scope.token = "";
    $scope.back = false;
    $scope.shipment = {};

    $scope.showLoading = function() {
      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none"  stroke-width="2" stroke-miterlimit="10"/></svg></div></strong>'
      });
    };

    $scope.hideLoading = function(){
      $ionicLoading.hide().then(function(){
         console.log("The loading indicator is now hidden");
      });
    };

    $scope.toggleLeft = function() {
      $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.isJson = function(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    $scope.isTokenValid = function(user, token){
      if(user !== null && token !== null){
        if(!$scope.isJson(user)){
          return false;
        }

        $scope.user = JSON.parse(user);
        $scope.token = token;
        var data = {
          keyword:"today-shipments",
          user_id:$scope.user.id,
          token:$scope.token
        };
        var success = function(response){
          var result = response.data;
          if(result.status === 1){
            $scope.user = JSON.parse(user);
            $scope.token = token;
            return true;
          }
          else{
            console.log(result.message);
            return false;
          }
        };
        var fail = function(response){
          alert(JSON.stringify(response));
          return false;
        };

        return $scope.ajax_request(data,success,fail);
      }
      return false;
    };

    // $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    //   if(storage.getItem('token') != null){
    //     if(toState.name=="login"){
    //       navigator.app.exitApp();
    //     }
    //   }
    // });

    $scope.init = function(){
      ionicMaterialInk.displayEffect();

      if(!$scope.isTokenValid(storage.getItem('user'), storage.getItem('token'))){
        $scope.signout();
      }
    };
    $scope.pusher = new Pusher('3baaa682d4ac6a04a39b', {
      cluster: 'ap1',
      encrypted: true
    });
    $scope.channel = null;
    $scope.signout = function(){
      $scope.showLoading();
      if($scope.isTokenValid(storage.getItem('user'), storage.getItem('token'))){
        $scope.user = JSON.parse(storage.getItem('user'));
        $scope.token = storage.getItem('token');
        var data = {
          keyword:'signout',
          user_id:$scope.user.id,
          token:$scope.token
        };
        var success = function(response){
          if(response.data.status == 1){
            $scope.clearAllAndLogin();
            $scope.hideLoading();
          }
          else{
            $scope.clearAllAndLogin();
            console.log(response.data.message);
            $scope.hideLoading();
          }
        };
        var fail = function(response){
          $scope.clearAllAndLogin();
          alert(JSON.stringify(response));
          $scope.hideLoading();
        };
        return $scope.ajax_request(data, success, fail);
      }
      else{
        $scope.clearAllAndLogin();
        $scope.hideLoading();
      }
    };

    $scope.goToState = function(state, params, options){
      $scope.showLoading();
      if(state != 'login'){
        options = options || {};
        params = params || {};
        $state.transitionTo(state, params, options);
      }
      else{
        $scope.signout();
      }
      $scope.hideLoading();
    };
    $scope.goTo = function(page, params){
      if(page != 'login'){
        params = params || 0;
        var url = "/#/"+page;
        if(params != 0){
          for(var i=0; i<params.length; i++){
            url = url + '/' + params[i];
          }
        }
        $scope.home_class = "";
        window.location.href = url;
      }
      else{
        $scope.signout();
      }
    };

    $scope.ajax_request = function(data, success, fail){
      return $http({
        url:'http://q-dev.ga/ervill/public/api',
        method:'POST',
        dataType:'json',
        data:data,
        headers: {
          "Content-Type": "application/json"
        }
      }).then(success,fail);
    };

    $scope.clearAllAndLogin = function(){
      storage.removeItem("user");
      storage.removeItem("token");
      window.location.href = "#/login";
      // $scope.goToState('login');
    }

    $scope.doRefresh = function() {
      console.log('Refreshing!');
      $timeout( function() {
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');

      }, 2000);
    };
  });
