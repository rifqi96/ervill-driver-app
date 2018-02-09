ng_app.controller('OrderCtrl', function($rootScope, $scope, $stateParams, $ionicHistory, $ionicViewSwitcher){
  $scope.mode = $stateParams.mode;
  // $scope.shipment = JSON.parse(storage.getItem('shipment'));
  $scope.orders_history = null;
  $scope.orders = null;
  $scope.order = JSON.parse(storage.getItem('order'));
  $scope.hasOrders = false;
  $scope.data = {};
  $scope.message = "";
  $scope.finish_type = "";
  $scope.issue_id_del = null;
  $scope.title = "";
  $scope.shipment = JSON.parse(storage.getItem('shipment'));

  $scope.init = function(){
		if(!$scope.isTokenValid(storage.getItem('user'), storage.getItem('token'))){
			$scope.signout();
		}
		else{
      if($scope.mode == "list"){
        $scope.getOrders();
        $scope.getOrdersHistory();
      }
      else if($scope.mode == "details" || $scope.mode == "issues"){
        $scope.getOrderDetails();
        $scope.back = true;
      }
      else{ //History
        if(storage.getItem('prev_route') == "history"){
          $scope.title = "List Pesanan #" + $scope.shipment.id;
        }
        $scope.getOrdersHistory();
      }
		}
	};

  $scope.getOrdersHistory = function(){
    var data = {
      user_id:$scope.user.id,
      token:$scope.token,
      keyword:'orders-history-by-shipment',
      shipment_id:$scope.shipment.id
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

  $scope.orderDetails = function(order){
    var params = {
      mode:'details'
    };

    storage.setItem('order', JSON.stringify(angular.copy(order)));

    $scope.goToState('order.details', params);
  };

  $scope.getOrders = function(){
    var data = {
      user_id:$scope.user.id,
      token:$scope.token,
      keyword:'orders-by-shipment',
      shipment_id:$scope.shipment.id
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
      order_id:$scope.order.id
    };

    var success = function(response){
      var result = response.data;

      if(result.status == 1){
        result.data.order.total = numeral(result.data.order.total).format('$0,0');
        $scope.order = result.data.order;
        $scope.issues = result.data.issues;
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

    var data = {
      user_id:$scope.user.id,
      token:$scope.token,
      keyword:'cancel-transaction',
      order_id:$scope.order.id
    };

    var success = function(response){
      var result = response.data;

      if(result.status == 1){
        $rootScope.$broadcast('showAlert', {
          title:'Berhasil',
          template:'Berhasil membatalkan transaksi. Mohon untuk meberi informasi ke admin.'
        });
        $scope.goToState('orders.list', {mode:'list'});
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
          order_id:$scope.order.id,
          description:res.description,
          quantity:res.qty,
          type:res.type
        };

        var success = function(response){
          var result = response.data;

          if(result.status == 1){
            $rootScope.$broadcast('showAlert', {
              title:'Berhasil',
              template:'Berhasil menambahkan masalah'
            });
            $scope.init();
            $scope.hideLoading();
          }
          else if(result.status == 0){
            $rootScope.$broadcast('showAlert', {
              title:'Gagal',
              template:result.message
            });
            $scope.hideLoading();
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
    if($scope.order.id !== null){
      $scope.showLoading();

      var data = {
        user_id:$scope.user.id,
        token:$scope.token,
        keyword:'drop-gallon',
        order_id:$scope.order.id
      };

      var success = function(response){
        var result = response.data;

        if(result.status == 1){
          $rootScope.$broadcast('showAlert', {
            title:'Berhasil',
            template:'Transaksi Berhasil'
          });
          $scope.goToState('orders.list', {mode:'list'});
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

  $scope.goBack = function() {
    // window.history.back();
    if(storage.getItem('prev_route') == "today_shipments"){
      $scope.goToState('orders.list', {
        mode:'list'
      });
    }
    else{ // history
      $scope.goToState('all_orders_history', {
        mode:'history'
      });
    }
    $ionicViewSwitcher.nextDirection('back');
  };

  $scope.onHold = function(issue_id){
    if($scope.shipment.status != "Selesai"){
      $scope.issue_id_del = issue_id;
      $rootScope.$broadcast('showActionSheet');
    }
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
          $scope.hideLoading();
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
      shipment_id:$scope.shipment.id
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

  $scope.$on('modalReturn', function(evt, args){
    $scope.edit(args);
  });

  $scope.edit = function(form){
    form.edit = form.edit || {};
    var edit = form.edit;

    edit.qty = edit.qty==undefined?$scope.order.gallon_qty:edit.qty;
    edit.empty_qty = edit.empty_qty==undefined?$scope.order.empty_gallon_qty:edit.empty_qty;

    // if(edit.description==undefined){
    //   edit.description = "Driver tidak memberi alasan. Silahkan hubungi driver terkait pengubahan jumlah orderan.";
    // }

    var data = {
      user_id:$scope.user.id,
      token:$scope.token,
      keyword:'edit-order',
      order_id:$scope.order.id,
      gallon_qty:edit.qty,
      empty_gallon_qty:edit.empty_qty,
      description:edit.description
    };

    var success = function(response){
      var result = response.data;

      if(result.status == 1){
        $rootScope.$broadcast('showAlert', {
          title:'Berhasil',
          template:'Berhasil mengubah jumlah pesanan pada order ini'
        });
        $rootScope.$broadcast('modalSetQty', {
          qty:data.gallon_qty,
          empty_qty:data.empty_gallon_qty
        });
        $scope.goToState('order.details', {mode:'details'}, {reload:true});
      }
      else if(result.status == 0){
        $rootScope.$broadcast('showAlert', {
          title:'Gagal',
          template:result.message
        });
        $scope.goToState('order.details', {mode:'details'}, {reload:true});
      }
      else{ // Invalid Token
        $scope.signout();
      }

    };

    var fail = function(response){
      alert(JSON.stringify(response));

      $scope.signout();
    };

    form.edit = {};

    $scope.ajax_request(data,success,fail);
  };

  $scope.openModal = function(){
    $rootScope.$broadcast('modalInit',{
      title:'Edit Order #' + $scope.order.id,
      content:'templates/pages/edit-order.html',
      data:$scope.order
    });
    $rootScope.$broadcast('openModal');
  };

});
