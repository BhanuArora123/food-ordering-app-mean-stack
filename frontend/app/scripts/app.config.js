

appModule.config(function ($stateProvider, $httpProvider, $urlRouterProvider, blockUIConfig) {
  // spinner config 
  blockUIConfig.autoBlock = false;
  $stateProvider
    .state({
      name: "home",
      url: "",
      abstract: true,
      resolve: {
        userData: function (adminService, outletService, brandService) {
          var role = localStorage.getItem("role");
          if (!role) {
            return;
          }
          if (role === "brand") {
            return brandService
              .getBrandData()
          }
          else if (role === "outlet") {
            return outletService
              .getOutletData();
          }
          else {
            return adminService
              .getAdminData()
          }
        }
      },
      views: {
        "header": {
          templateUrl: "views/home/header.html",
          controller: "homeController"
        },
        "body": {
          controller: "homeController",
          templateUrl: "views/home/body.html",
        }
      }
    })
    .state({
      name: "home.dashboard",
      url: "/",
      controller: "dashboardController",
      templateUrl: "views/home/dashboard.html"
    })
    .state({
      name: "home.login",
      url: "/login",
      controller: "loginSignupController",
      templateUrl: "views/home/login.html",
      resolve: {
        role: function () {
          return '';
        }
      }
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
        },
        allCategories: function (foodService) {
          return foodService
            .getCategories()
            .then(function (data) {
              return data.categories.map(function (category) {
                return category.name;
              });
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        availableTaxes: function (taxService) {
          return taxService
            .getTaxes()
            .then(function (data) {
              return data.taxes;
            })
            .catch(function (error) {
              console.log(error);
            })
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
      templateUrl: "views/admin/index.html",
      abstract: true
    })
    .state({
      name: "home.admin.display",
      url: "/display",
      controller: "adminController",
      templateUrl: "views/admin/profile.html",
      resolve: {
        adminData: function (adminService) {
          return adminService
            .getAdminData()
            .then(function (data) {
              console.log("admin data - ", data.adminData);
              return data.adminData;
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        allBrands: function (adminService) {
          return adminService
            .getBrands()
            .then(function (data) {
              return data.brands;
            })
            .catch(function (error) {
              console.log(error);
            })
        }
      }
    })
    // orders
    .state({
      name: "home.orders",
      url: "/orders",
      templateUrl: "views/orders/index.html",
      abstract: true
    })
    .state({
      name: "home.orders.display",
      url: "/display",
      controller: "ordersController",
      templateUrl: "views/orders/display.html",
      resolve: {
        outletOrders: function (orderService, brandService, outletService) {
          return orderService
            .getAllOrders()
            .then(function (data) {
              return data.orders;
            })
            .catch(function (error) {
              console.log(error);
            })
        }
      }
    })
    .state({
      name: "home.outlet",
      url: "/outlet",
      templateUrl: "views/outlet/index.html",
      abstract: true
    })
    .state({
      name: "home.outlet.display",
      url: "/profile",
      controller: "outletController",
      templateUrl: "views/outlet/profile.html",
      resolve: {
        outletData: function (outletService) {
          return outletService
            .getOutletData()
            .then(function (data) {
              return data.outletData
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        tablesData: function (outletService) {
          return outletService
            .getTables(1, 9)
            .then(function (data) {
              return data.tables;
            })
            .catch(function (error) {
              console.log(error);
            })
        }
      }
    })
    .state({
      name: "home.brand",
      templateUrl: "views/brand/index.html",
      url: "/brand"
    })
    .state({
      name: "home.brand.display",
      templateUrl: "views/brand/profile.html",
      url: "/profile",
      controller: "brandsController",
      resolve: {
        brandData: function (brandService) {
          return brandService
            .getBrandData()
            .then(function (data) {
              return data.brandData
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        allOutlets: function (brandService) {
          return brandService
            .getAllOutlets(1, 9)
            .then(function (data) {
              return data.outlets;
            })
            .catch(function (error) {
              console.log(error);
            })
        }
      }
    })
    .state({
      name: "home.add",
      url: "/add/:role",
      controller: "loginSignupController",
      templateUrl: "views/home/login.html",
      resolve: {
        role: function ($stateParams) {
          return $stateParams.role;
        }
      }
    })

  // default route 
  $urlRouterProvider.otherwise("/");
  // adding interceptor
  $httpProvider.interceptors.push('intercepterService');
})
  .run(function ($location, $timeout, $rootScope) {
    // route safety 

    $rootScope.$on("$stateChangeStart", function (event) {
      var token = localStorage.getItem("token");
      if (!token) {
        $timeout(function () {
          $location.url("login");
        })
      }
    })

  })