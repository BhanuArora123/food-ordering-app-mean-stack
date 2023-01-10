

appModule.config(function ($stateProvider, $httpProvider, $urlRouterProvider, blockUIConfig, oiSelectProvider) {

  oiSelectProvider.options.debounce = 500;
  // spinner config 
  blockUIConfig.autoBlock = false;
  $stateProvider
    .state({
      name: "home",
      url: "",
      abstract: true,
      resolve: {
        userData: function (userService, $rootScope, utility) {
          $rootScope.currentBrandIndex = 0;
          $rootScope.currentOutletIndex = 0;
          var userData = localStorage.getItem("userData");
          console.log(userData);
          if (!userData) {
            return;
          }
          return userService
            .getUserData()
            .then(function (data) {
              utility.setPermissionAuthorization();
              return data.userData;
            })
            .catch(function (error) {
              console.log(error);
            })
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
      templateUrl: "views/home/dashboard.html",
      resolve: {
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
        connectOutlet: function (socketService, userService) {
          var outletsData = userService.userData()?.outlets;
          if (outletsData && outletsData[0]) {
            console.log(outletsData[0].id);
            socketService.emitEvent("connectOutlet", {
              brandId: outletsData[0].brand.id
            })
          }
        },
        setPermissionAuthorization: function (utility) {
          utility.setPermissionAuthorization();
        }
      }
    })
    .state({
      name: "home.login",
      url: "/login",
      controller: "loginSignupController",
      templateUrl: "views/home/login.html",
      resolve: {
        params: function ($stateParams) {
          return {
            role: $stateParams.role,
            subRole: $stateParams.subRole
          };
        },
        adminCount: function (userService) {
          return userService
            .adminCount()
            .then(function (data) {
              return data.totalAdmins
            })
            .catch(function (error) {
              console.log(error);
            })
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
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
        allCategories: function (foodService) {
          return foodService
            .getCategories()
            .then(function (data) {
              return data.categories;
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
        },
        availableCategories: function (foodService) {
          return foodService
            .getAvailableCategories()
            .then(function (data) {
              return data.categories
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
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
        adminData: function (userService) {
          return userService
            .getUserData()
            .then(function (data) {
              console.log("admin data - ", data.userData);
              return data.userData;
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        brandsData: function (brandService) {
          return brandService
            .getBrands(1, 9)
            .then(function (data) {
              return {
                allBrands: data.brands,
                totalBrands: data.totalBrands
              };
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        allBrandAdmins: function (brandService) {
          return brandService.getBrandUsers(1, 9, undefined, "admin")
            .then(function (data) {
              return {
                brandAdmins: data.brandUsers,
                totalBrandAdmins: data.brandUsersCount
              };
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        allAdmins: function (userService) {
          return userService
            .getAllAdmins(1, 9)
            .then(function (data) {
              return {
                admins: data.admins,
                totalAdmins: data.totalAdmins
              }
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
      abstract: true,
      resolve: {
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
      }
    })
    .state({
      name: "home.orders.display",
      url: "/display",
      controller: "ordersController",
      templateUrl: "views/orders/display.html",
      resolve: {
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
        outletOrders: function (orderService, brandService, outletService, userService) {
          return orderService
            .getAllOrders(undefined, "Dine In", undefined, 1, 9)
            .then(function (data) {
              return {
                orders: data.orders,
                totalOrders: data.totalOrders
              };
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
      abstract: true,
      resolve: {
        authenticate: function (auth) {
          return auth.isAuthenticated();
        }
      }
    })
    .state({
      name: "home.outlet.display",
      url: "/profile",
      controller: "outletController",
      templateUrl: "views/outlet/profile.html",
      resolve: {
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
        userData: function (userService) {
          return userService
            .getUserData()
            .then(function (data) {
              return data.userData;
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        tablesData: function (outletService) {
          return outletService
            .getTables(1, 9)
            .then(function (data) {
              return {
                tablesData: data.tables,
                totalTables: data.totalTables
              };
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        outletUsers: function (outletService, userService, $rootScope) {
          console.log("current index - ", $rootScope.currentOutletIndex);
          var outletData = userService.userData().outlets[$rootScope.currentOutletIndex];
          return outletService
            .getOutletUsers(1, 9, outletData.id, undefined, outletData.brand.id)
            .then(function (data) {
              return {
                outletUsers: data.outletUsers,
                totalOutletUsers: data.outletUsersCount
              };
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
      url: "/brand",
      resolve: {
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
      }
    })
    .state({
      name: "home.brand.display",
      templateUrl: "views/brand/profile.html",
      url: "/profile",
      controller: "brandsController",
      resolve: {
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
        userData: function (userService) {
          return userService
            .getUserData()
            .then(function (data) {
              return data.userData;
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        outletsData: function (outletService, userService, $rootScope) {
          var userData = userService.userData();
          if (!userData || !userData.brands) {
            return [];
          }
          var brandData = userData.brands[$rootScope.currentBrandIndex];
          return outletService
            .getAllOutlets(1, 9, brandData.id)
            .then(function (data) {
              return {
                allOutlets: data.outlets,
                totalOutlets: data.totalOutlets
              };
            })
            .catch(function (error) {
              console.log(error);
            });
        },
        customersData: function (customerService, userService, $rootScope) {
          var brandId = userService.userData().brands[$rootScope.currentBrandIndex].id;
          return customerService
            .getAllCustomers(1, 9, brandId)
            .then(function (data) {
              return {
                allCustomers: data.customers,
                totalCustomers: data.totalCustomers
              };
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        allOutletAdmins: function (outletService, userService, $rootScope) {
          var brandId = userService.userData().brands[$rootScope.currentBrandIndex].id;
          return outletService.getOutletUsers(1, 9, undefined, "admin", brandId)
            .then(function (data) {
              return {
                outletAdmins: data.outletUsers,
                totalOutletAdmins: data.outletUsersCount
              };
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        brandUsers: function (brandService, userService, $rootScope) {
          var brandId = userService.userData().brands[$rootScope.currentBrandIndex].id;
          return brandService.getBrandUsers(1, 9, brandId)
            .then(function (data) {
              return {
                brandUsers: data.brandUsers,
                totalBrandUsers: data.brandUsersCount
              };
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
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
        params: function ($stateParams) {
          return {
            role: $stateParams.role,
            subRole: $stateParams.subRole
          };
        },
        adminCount: function (userService) {
          return userService
            .adminCount()
            .then(function (data) {
              return data.totalAdmins
            })
            .catch(function (error) {
              console.log(error);
            })
        }
      }
    })
    .state({
      name: "home.addUser",
      url: "/user/add/:role?subRole",
      controller: "loginSignupController",
      templateUrl: "views/addUsers.html",
      resolve: {
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
        params: function ($stateParams) {
          return {
            role: $stateParams.role,
            subRole: $stateParams.subRole
          };
        },
        adminCount: function (userService) {
          return userService
            .adminCount()
            .then(function (data) {
              return data.totalAdmins
            })
            .catch(function (error) {
              console.log(error);
            })
        }
      }
    })
    .state({
      name: "home.reports",
      url: "/reports/display",
      controller: "reportsController",
      templateUrl: "views/reports/display.html",
      resolve: {
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
      }
    })
    .state({
      name: "home.customer",
      url: "/customer",
      abstract: true,
      templateUrl: "views/customer/index.html"
    })
    .state({
      name: "home.customer.dashboard",
      url: "/home",
      controller: "customerController",
      templateUrl: "views/customer/home.html",
      resolve: {
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
        customerData: function (customerService, socketService) {
          return customerService
            .getCustomerByPhone()
            .then(function (data) {
              socketService.emitEvent("customerJoined", data?.customerData?._id);
              return data?.customerData;
            })
            .catch(function (error) {
              console.log(error);
            })
        }
      }
    })
    .state({
      name: "home.customer.login",
      url: "/login",
      controller: "customerLoginController",
      templateUrl: "views/customer/login.html",
    })
    .state({
      name: "home.offers",
      url: "/offers",
      templateUrl: "views/offers/index.html",
    })
    .state({
      name: "home.offers.display",
      url: "/display",
      templateUrl: "views/offers/display.html",
      controller: "offersController",
      resolve: {
        offers: function (offerService, userService, $rootScope) {
          var userData = userService.userData();
          var brandId = userData.brands[$rootScope.currentBrandIndex].id;
          return offerService
            .getOffersForBrand(1, 9, brandId)
            .then(function (data) {
              return {
                offers:data.offers,
                totalOffers:data.totalOffers
              };
            })
            .catch(function (error) {
              console.log(error);
            })
        }
      }
    })
    .state({
      name: "home.sendInstructions",
      url: "/send/instructions",
      // controller:"emailController",
      templateUrl: "views/email/send.html",
      resolve: {
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
      }
    })

  // default route 
  $urlRouterProvider.otherwise("/");
  // adding interceptor
  $httpProvider.interceptors.push('intercepterService');
})
  .run(function ($state, $rootScope, socketService, blockUI) {

    // route safety 

    var token = localStorage.getItem("token");
    $rootScope.$on("$stateChangeStart", function (event, toState) {
      blockUI.start();
      $rootScope.toState = toState;
    })
    $rootScope.$on("$stateChangeSuccess", function () {
      blockUI.stop();
    })
    $state.defaultErrorHandler(function (error) {
      console.log(error);
      blockUI.stop();
      if (error.detail === "Not Authenticated") {
        return $state.go("home.login")
      }
      else if (error.detail === "Not Authorized") {
        return $state.go("home.dashboard");
      }
      return $state.go("home.dashboard");
    });

    socketService.connect();
    if (!token) {
      return;
    }

  })
  // .factory('$location', downgradeInjectable($locationShim));