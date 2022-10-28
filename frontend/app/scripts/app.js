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
    'ngCookies',
    'ngResource',
    'ui.router',
    'ngSanitize',
    'ngTouch',
    "ui.bootstrap",
    'ngAnimate'
  ])

appModule.config(function ($stateProvider, $locationProvider,$httpProvider,$urlRouterProvider) {
  $stateProvider
    .state({
      name: "home",
      url: "",
      controller: "homeController",
      templateUrl: "views/main.html",
      abstract:true
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
    .state({
      name:"home.food",
      url:"/food",
      controller:"foodController",
      templateUrl:"views/food/index.html"
    })
    .state({
      name:"home.food.add",
      url:"/add",
      controller:"foodController",
      templateUrl:"views/food/addFood.html"
    })
    .state({
      name:"home.food.display",
      url:"/display",
      controller:"foodController",
      templateUrl:"views/food/displayFoodItem.html"
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