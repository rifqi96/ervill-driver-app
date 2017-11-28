ng_app.controller('OrderCtrl', function($rootScope, $scope, $stateParams){
  $scope.mode = $stateParams.mode;
  $scope.shipment_id = $stateParams.shipment_id;
  $scope.order_id = $stateParams.order_id;
  $scope.orders_history = null;
  $scope.orders = null;
  $scope.order = null;
  $scope.issues = null;
  $scope.hasOrders = false;
  $scope.data = {};

  $scope.init = function(){
		if(!$scope.isTokenValid(storage.getItem('user'), storage.getItem('token'))){
			$scope.signout();
		}
		else{
      if($scope.mode == "list"){
        $scope.order_id = null;
        $scope.getOrders();
      }
      else if($scope.mode == "details" || $scope.mode == "issues"){
        $scope.getOrderDetails();
        $scope.back = true;
      }
      else{ //History
        $scope.order_id = null;
        $scope.getOrdersHistory();
      }

      $scope.hideLoading();
		}
	};

  $scope.message = "";

  $scope.getOrdersHistory = function(){
    var data = {
      user_id:$scope.user.id,
      token:$scope.token,
      keyword:'orders-history-by-shipment',
      shipment_id:$scope.shipment_id
    };

    var success = function(response){
      var result = response.data;

      if(result.status == 1){
        if(result.data.length < 1){
          $scope.message = result.message;
          $scope.orders_history = null;
        }
        else{
          $scope.message = "";
          $scope.orders_history = result.data;
        }
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

  $scope.orderDetails = function(order_id){
    var params = {
      mode:'details',
      shipment_id:$scope.shipment_id,
      order_id:order_id
    };

    $scope.goToState('order-details', params);
  };

  $scope.getOrders = function(){
    var data = {
      user_id:$scope.user.id,
      token:$scope.token,
      keyword:'orders-by-shipment',
      shipment_id:$scope.shipment_id
    };

    var success = function(response){
      var result = response.data;
      if(result.status == 1){
        if(result.data.length > 0){
          $scope.orders = result.data;
          $scope.hasOrders = true;
        }
        else{
          $scope.message = result.message;
          $scope.hasOrders = false;
        }
      }
      else{
        console.log(result.message);
        $scope.signout();
      }
    };

    var fail = function(response){
      alert(JSON.stringify(response));
    };

    return $scope.ajax_request(data, success, fail);
  };

  $scope.getOrderDetails = function(){
    var data = {
      user_id:$scope.user.id,
      token:$scope.token,
      keyword:'order-details',
      order_id:$scope.order_id
    };

    var success = function(response){
      var result = response.data;

      if(result.status == 1){
        //$scope.order = result.data.order;
        $scope.order = result.data.order;
        $scope.issues = result.data.issues;
        $scope.order_id = $scope.order.id;
        $scope.message = result.message;
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

  $scope.$on('returnConfirm', function(evt, args){
    args.then(function(res){
      if(res){
        $scope.showLoading();

        if($scope.finish_type == "drop"){
          $scope.dropGallon();
        }
        else if($scope.finish_type == "shipment"){
          $scope.finishShipment();
        }
        else{ // Cancel Transaction
          $scope.cancelTransaction();
        }
      }
    });
  });

  $scope.cancelTransaction = function(){
    $scope.showLoading();
    $rootScope.$broadcast('showAlert', {
      title:'Berhasil',
      template:'Berhasil membatalkan transaksi. Mohon untuk meberi informasi ke admin.'
    });
    $scope.goToState('orders.list', {mode:'list', shipment_id:$scope.shipment_id, order_id:null});
  }

  $scope.finish_type = "";

  $scope.showConfirm = function(param){
    $scope.finish_type = param;
    if(param == "drop"){
      var args = {
        title:'Transaksi Selesai',
        template:'Selesai turunkan galon ?'
      };
    }
    else if(param == "shipment"){
      var args = {
        title:'Akhiri Pengiriman',
        template:'Ingin akhiri pengiriman ?'
      };
    }
    else{ // Cancel Transaction
      var args = {
        title:'Transaksi Batal',
        template:'Batalkan transaksi ?'
      };
    }

    $rootScope.$broadcast('showConfirm', args);
	};

  $scope.$on('returnPopup', function(evt, args){
    args.then(function(res){
      if(typeof res !== typeof undefined){
        $scope.showLoading();
        var data = {
          user_id:$scope.user.id,
          token:$scope.token,
          keyword:'add-issue',
          order_id:$scope.order_id,
          description:res.description,
          quantity:res.qty,
          type:res.type
        };

        console.log(data);

        var success = function(response){
          var result = response.data;

          if(result.status == 1){
            $rootScope.$broadcast('showAlert', {
              title:'Berhasil',
              template:'Berhasil menambahkan masalah'
            });
            $scope.init();
          }
          else if(result.status == 0){
            $rootScope.$broadcast('showAlert', {
              title:'Gagal',
              template:result.message
            });
          }
          else{ //Invalid Token
            $scope.signout();
          }
        };

        var fail = function(response){
          alert(JSON.stringify(response));
          $scope.signout();
        };

        return $scope.ajax_request(data, success, fail);
      }
    });
  });

  $scope.showPopup = function(){
    var template =
                  '<select ng-model="data.type" style="display:block; width:100%;">'+
                  '<option value="">Pilih solusi</option>'+
                  '<option value="Refund Gallon">Retur Galon</option>'+
                  '<option value="Refund Cash">Refund Cash</option>'+
                  '<option value="Kesalahan Customer">Kesalahan Customer</option>'+
                  '</select>'+
                  '<input type="number" ng-model="data.qty" placeholder="Jumlah Galon">'+
                  '<input type="text" ng-model="data.description" placeholder="Alasan Masalah">';
    var args = {
      template:template,
      title:'Ada Masalah',
      subtitle:'Silahkan input data masalah',
      model_total:3
    };

    $rootScope.$broadcast('showPopup', args);
  };

  $scope.dropGallon = function(){
    if($scope.order_id !== null){
      $scope.showLoading();

      var data = {
        user_id:$scope.user.id,
        token:$scope.token,
        keyword:'drop-gallon',
        order_id:$scope.order_id
      };

      var success = function(response){
        var result = response.data;

        if(result.status == 1){
          $rootScope.$broadcast('showAlert', {
            title:'Berhasil',
            template:'Transaksi Berhasil'
          });
          $scope.goToState('orders.list', {mode:'list', shipment_id:$scope.shipment_id, order_id:null});
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
    }
  };

  $scope.back = false;

  $scope.goBack = function() {
    $scope.goToState('orders.list', {
      mode:'list',
      shipment_id:$scope.shipment_id,
    });
  };

  $scope.issue_id_del = null;
  $scope.onHold = function(issue_id){
    $scope.issue_id_del = issue_id;
    $rootScope.$broadcast('showActionSheet');
  };

  $scope.$on('returnActionSheet', function(evt, args){
    if(args){
      // remove issue
      $scope.showLoading();

      var data = {
        user_id:$scope.user.id,
        token:$scope.token,
        keyword:'remove-issue',
        issue_id:$scope.issue_id_del
      };

      var success = function(response){
        var result = response.data;

        if(result.status == 1){
          $rootScope.$broadcast('showAlert', {
            title:'Berhasil',
            template:'Berhasil menghapus masalah'
          });
          $scope.issue_id_del = null;
          $scope.init();
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
    }
  });

  $scope.finishShipment = function(){
    // finish-shipment
    $scope.showLoading();

    var data = {
      user_id:$scope.user.id,
      token:$scope.token,
      keyword:'finish-shipment',
      shipment_id:$scope.shipment_id
    };

    var success = function(response){
      var result = response.data;

      if(result.status == 1){
        $rootScope.$broadcast('showAlert', {
          title:'Berhasil',
          template:'Pengiriman telah diakhiri'
        });
        $scope.goToState('shipments');
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

});
