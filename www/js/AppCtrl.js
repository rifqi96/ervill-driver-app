ng_app.controller('AppCtrl', function($scope, $http, $rootScope, $window, $ionicSideMenuDelegate, $timeout, $state, $ionicLoading){
    $scope.showLoading = function() {
      $ionicLoading.show({
        template: 'Mohon tunggu...',
        duration: 3000
      }).then(function(){
         console.log("The loading indicator is now displayed");
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
    $scope.init = function(){
      if(!$scope.isTokenValid(storage.getItem('user'), storage.getItem('token'))){
        $scope.signout();
      }
    };
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
          }
          else{
            $scope.clearAllAndLogin();
            console.log(response.data.message);
          }
        };
        var fail = function(response){
          $scope.clearAllAndLogin();
          alert(JSON.stringify(response));
        };
        return $scope.ajax_request(data, success, fail);
      }
      else{
        $scope.clearAllAndLogin();
      }
      $scope.hideLoading();
    };

    $scope.user = {};
    $scope.token = "";

    $scope.goToState = function(state, params){
      $scope.showLoading();
      if(state != 'login'){
        params = params || 0;
        if(params != 0){
          $state.transitionTo(state, params, {reload:true, inherit:false, notify:true});
        }
        else{
          $state.transitionTo(state, {}, {reload:true, inherit:false, notify:true});
        }
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
