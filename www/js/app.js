// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// System.setProperty("http.keepAlive", "false");

// zipalign location: ~/Library/Android/sdk/build-tools/27.0.1/zipalign

var storage = window.localStorage;

var ng_app = angular.module('ervill', ['ionic', 'ionic-material'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
      StatusBar.styleLightContent();
      StatusBar.backgroundColorByHexString('#2c65c1');
      // if (platform.is('android')) {
      //   StatusBar.styleDefault();
      //   StatusBar.styleLightContent();
      //   StatusBar.backgroundColorByHexString('#2c65c1');
      // }
      // else if(platform.is('ios')){
      //   StatusBar.overlaysWebView(true);
      //   StatusBar.styleLightContent();
      // }
      // else{
      //   StatusBar.styleDefault();
      // }
    }
    $ionicPlatform.registerBackButtonAction(function () {
      navigator.app.exitApp();
    }, 100);
  })
})
.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            })
            .state('shipments', {
                url: '/shipments',
                templateUrl: 'templates/pages/shipments.html',
                controller: 'ShipmentCtrl',
                cache: false
            })
            .state('shipments_history', {
                url: '/shipments/history',
                templateUrl: 'templates/pages/shipments-history.html',
                controller: 'ShipmentHistoryCtrl',
                cache: false
            })
            .state('all_orders_history', {
              url: '/shipments/history/orders/:mode',
              cache: false,
              templateUrl: 'templates/pages/orders-history.html',
              params: {
                mode:'history',
              },
              controller:'OrderCtrl'
            })
           .state('orders', {
             url: "/orders",
             abstract: true,
             cache: false,
             templateUrl: "templates/pages/orders.html"
           })
           .state('orders.list', {
             url: '/:mode',
             cache: false,
             views: {
               'orders-list': {
                 templateUrl: 'templates/pages/orders-list.html',
                 params: {
                   mode:'list',
                 }
               }
             }
           })
           .state('orders.history', {
             url: '/:mode',
             cache: false,
             views: {
               'orders-history': {
                 templateUrl: 'templates/pages/orders-history.html',
                 params: {
                   mode:'history',
                 }
               }
             }
           })
           .state('order', {
             url: "/orders",
             abstract: true,
             cache: false,
             templateUrl: "templates/pages/order.html"
           })
           .state('order.details', {
             url: '/:mode',
             cache: false,
             views: {
               'order-details': {
                 templateUrl: 'templates/pages/order-details.html',
                 params: {
                   mode:'details'
                 }
               }
             }
           })
           .state('order.issues', {
             url: '/:mode',
             cache: false,
             views: {
               'order-issues': {
                 templateUrl: 'templates/pages/order-issues.html',
                 params: {
                   mode:'issues'
                 }
               }
             }
           });

         $ionicConfigProvider.tabs.position('bottom');

        $urlRouterProvider.otherwise('/login');
    });
