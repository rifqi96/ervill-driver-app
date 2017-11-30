ng_app.controller('ModalCtrl', function($rootScope, $scope, $ionicModal) {
  $scope.modal_title = "";
  $scope.modal_content = "";
  $scope.right_button = "";
  $scope.data = {};

  $scope.init = function(data){
    if(data != null){
      $scope.modal_title = data.title;
      $scope.modal_content = data.content;
      $scope.right_button = data.right_button;
      $scope.data = data.data;
    }
  };

  $scope.$on('modalInit', function(evt, args){
    $scope.init(args);
  });
  $scope.$on('closeModal', function(evt, args){
    $scope.closeModal();
  });
  $scope.$on('modalSetQty', function(evt, args){
    $scope.data.gallon_qty = args.qty;
    $scope.data.empty_gallon_qty = args.empty_qty;
  });
  $scope.return = function(){
    $rootScope.$broadcast('modalReturn', $scope.data);
    // $scope.modal_title = "";
    // $scope.modal_content = "";
    // $scope.right_button = "";
    // $scope.data = {};
  };
  $ionicModal.fromTemplateUrl('templates/layouts/modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.$on('openModal', function(){
    $scope.modal.show();
    // $scope.openModal();
  });
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
});
