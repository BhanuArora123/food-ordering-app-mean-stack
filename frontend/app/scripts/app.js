'use strict';

/**
 * @ngdoc overview
 * @name frontendApp
 * @description
 * # frontendApp
 *
 * Main module of the application.
 */
var appModule = angular
  .module('appModule', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ui.router',
    'ngSanitize',
    'ngTouch',
    "ui.bootstrap"
  ])

appModule.config(function ($stateProvider, $locationProvider,$httpProvider,$urlRouterProvider) {
  $stateProvider
    .state({
      name: "home",
      url: "",
      controller: "homeController",
      templateUrl: "views/main.html"
    })
    .state({
      name: "home.dashboard",
      url: "/",
      controller: "dashboardController",
      templateUrl: "views/dashboard.html"
    })
    .state({
      name: "home.login",
      url: "/login",
      controller: "loginSignupController",
      templateUrl: "views/login.html"
    })
  // $locationProvider.html5Mode(true);

  // default route 
  $urlRouterProvider.otherwise("/");

  // adding interceptor
  $httpProvider.interceptors.push('intercepterService');
})
  .run(function ($state,$timeout) {
    // route safety 
    var token = localStorage.getItem("token");
    if (!token) {
      $timeout(function () {
        $state.go("home.login");
      })
    }
  })
