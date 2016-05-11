// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })


      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })


      .state('app.librosdigitales', {
        url: '/librosdigitales',
        views: {
          'menuContent': {
            templateUrl: 'templates/librosdigitales.html'
          }
        }
      })

      .state('app.cursos', {
        url: '/cursos',
        views: {
          'menuContent': {
            templateUrl: 'templates/cursos.html',
          }
        }
      })


      .state('app.tab', {
        url: '/tab',
        abstract: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/tabs.html'
          }
        }
      })

      .state('app.tab.libros', {
        url: '/libros',
        views: {
          'tab-libros': {
            templateUrl: 'templates/libros.html',
            controller: 'LibrosCtrl'
          }
        }
      })


      .state('app.tab.pedidos', {
        url: '/pedidos',
        views: {
          'tab-pedidos': {
            templateUrl: 'templates/pedidos.html',
            controller: 'PedidosCtrl'
          }
        }
      })

      .state('app.tab.detalle-libro', {
        url: '/libros/:libroId',
        views: {
          'tab-libros': {
            templateUrl: 'templates/detalle-libro.html',
            controller: 'DetalleLibroCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    //$urlRouterProvider.otherwise('/app/playlists');
    $urlRouterProvider.otherwise('/login');
  });
