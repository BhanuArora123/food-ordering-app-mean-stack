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

appModule.config(function ($stateProvider, $locationProvider) {
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
      controller: "loginController",
      templateUrl: "views/login.html"
    })
    .state({
      name: "home.signup",
      url: "/signup",
      controller: "signupController",
      templateUrl: "views/signup.html"
    })
  $locationProvider.html5Mode(true);
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
