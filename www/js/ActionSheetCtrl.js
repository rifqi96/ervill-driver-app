ng_app.controller('ActionSheetCtrl',function($rootScope, $scope, $ionicActionSheet, $timeout) {
    $scope.$on('showActionSheet', function(evt, args){
      $scope.show();
    });

   // Triggered on a button click, or some other target
   $scope.show = function() {
     // Show the action sheet
     return $ionicActionSheet.show({
       // buttons: [
       //   { text: '<b>Share</b> This' },
       //   { text: 'Move' }
       // ],
       destructiveText: 'Hapus Masalah',
       // titleText: 'Modify your album',
       cancelText: 'Batal',
       destructiveButtonClicked: function(index) {
         $rootScope.$broadcast('returnActionSheet', true);
         return true;
       },
       cancel: function() {
            $rootScope.$broadcast('returnActionSheet', false);
          },
     });

     // // For example's sake, hide the sheet after two seconds
     // $timeout(function() {
     //   hideSheet();
     // }, 2000);

   };
});
