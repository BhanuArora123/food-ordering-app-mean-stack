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
    'ngAnimate',
    'ngStorage'
  ])

appModule.config(function ($stateProvider, $httpProvider, $urlRouterProvider, $localStorageProvider) {
  $stateProvider
    .state({
      name: "home",
      url: "",
      controller: "homeController",
      templateUrl: "views/main.html",
      abstract: true,
      resolve: {
        userData: function (adminService, userService, outletService) {
          var role = localStorage.getItem("role");
          if (!role) {
            return;
          }
          if (role === "outlet") {
            return outletService
              .getOutletData()
          }
          else if (role === "user") {
            return userService
              .getUserData();
          }
          else {
            return adminService
              .getAdminData()
          }
        }
      }
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
      name: "home.food",
      url: "/food",
      controller: "foodController",
      templateUrl: "views/food/index.html",
      abstract: true,
      resolve: {
        foodItems: function (foodService) {
          var foodItemsData = foodService
            .getFoodItems({})
            .then(function (data) {
              return data.matchedFoodItems;
            });
          return foodItemsData;
        }
      }
    })
    .state({
      name: "home.food.add",
      url: "/add",
      controller: "foodController",
      templateUrl: "views/food/addFood.html"
    })
    .state({
      name: "home.food.display",
      url: "/display",
      controller: "foodController",
      templateUrl: "views/food/displayFood.html"
    })
    .state({
      name: "home.admin",
      url: "/admin",
      controller: "adminController",
      templateUrl: "views/admin/index.html",
      abstract: true
    })
    .state({
      name: "home.admin.add",
      url: "/add",
      controller: "adminController",
      templateUrl: "views/admin/createUser.html"
    })
  // $locationProvider.html5Mode(true);

  // default route 
  $urlRouterProvider.otherwise("/");
  // adding interceptor
  $httpProvider.interceptors.push('intercepterService');
})
  .run(function ($state, $timeout) {
    // route safety 
    var token = localStorage.getItem("token");
    if (!token) {
      $timeout(function () {
        $state.go("home.login");
      })
    }
  })
