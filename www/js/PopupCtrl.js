ng_app.controller('PopupCtrl',function($rootScope, $scope, $ionicPopup, $timeout) {

  // Triggered on a button click, or some other target
  $scope.$on('showPopup', function(evt, args){
    $rootScope.$broadcast('returnPopup', $scope.showPopup(args));
  });

  $scope.$on('showConfirm', function(evt, args){
    $rootScope.$broadcast('returnConfirm', $scope.showConfirm(args.title, args.template));
  });

  $scope.$on('showAlert', function(evt,args){
    $scope.showAlert(args.title, args.template);
  });

  $scope.showPopup = function(args) {
    $scope.data = {};

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: args.template,
      title: args.title,
      subTitle: args.subtitle,
      scope: $scope,
      buttons: [
        { text: 'Batal' },
        {
          text: '<b>Simpan</b>',
          type: 'button-assertive',
          onTap: function(e) {
            if (Object.keys($scope.data).length < args.model_total) {
                e.preventDefault();
            }
            else {
              return $scope.data;
            }
          }
        }
      ]
    });

    return myPopup;
    // myPopup.then(function(res) {
    //   console.log('Tapped!', res);
    // });

    // $timeout(function() {
    //    myPopup.close(); //close the popup after 3 seconds for some reason
    // }, 3000);
   };

 // A confirm dialog
 $scope.showConfirm = function(title, template) {
   var confirmPopup = $ionicPopup.confirm({
     title: title,
     template: template
   });

   return confirmPopup;
 };

 // An alert dialog
 $scope.showAlert = function(title, template) {
   var alertPopup = $ionicPopup.alert({
     title: title,
     template: template
   });

   alertPopup.then(function(res) {
     console.log('Popup showed');
   });
 };
});
