

appModule.config(function ($stateProvider, $httpProvider, $urlRouterProvider, blockUIConfig, oiSelectProvider) {

  oiSelectProvider.options.debounce = 500;
  // spinner config 
  blockUIConfig.autoBlock = false;
  $stateProvider
    .state({
      name: "home",
      url: "",
      abstract: true,
      resolve:{
        userData: function (userService,$rootScope) {
          var userData = localStorage.getItem("userData");
          console.log(userData);
          if(!userData ){
            return;
          }
          return userService
            .getUserData()
            .then(function (data) {
              $rootScope.userRole = data.userData.role.name;
              $rootScope.$watch("userRole",function (newValue,oldValue) {
                console.log("variable update - ",newValue,oldValue);
              })
              return data.userData;
            })
            .catch(function (error) {
              console.log(error);
            })
        },
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
        connectToOutlet: function (socketService, outletService) {
          var outletData = outletService.getServiceData().outletData;
          if (outletData) {
            console.log(outletData._id);
            socketService.emitEvent("connectOutlet", {
              brandId: outletData.brand.id
            })
          }
        }
      }
    })
    .state({
      name: "home.login",
      url: "/login",
      controller: "loginSignupController",
      templateUrl: "views/home/login.html",
      resolve: {
        role: function () {
          return '';
        },
        // adminCount:function (userService) {
        //   return userService
        //   .adminCount()
        //   .then(function (data) {
        //     return data.totalAdmins
        //   })
        //   .catch(function (error) {
        //     console.log(error);
        //   })
        // }
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
      authenticate: function (auth) {
        return auth.isAuthenticated();
      },
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
        allAdmins: function (userService) {
          return userService
          .getAllAdmins(1,9)
          .then(function (data) {
            return {
              admins:data.admins,
              totalAdmins:data.totalAdmins
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
        outletData: function (userService) {
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
        outletUsers: function (outletService,userService) {
          var outletId = userService.userData().outlets[0].id;
          return outletService
          .getOutletUsers(1,9,outletId)
          .then(function (data) {
            return {
              outletUsers:data.outletUsers,
              totalOutletUsers:data.outletUsersCount
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
        brandData: function (userService) {
          return userService
            .getUserData()
            .then(function (data) {
              return data.userData;
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        outletsData: function (outletService,userService) {
          var userData = userService.userData();
          if(!userData.brands){
            return [];
          }
          var brandData = userData.brands[0];
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
        customersData: function (customerService) {
          return customerService
            .getAllCustomers(1, 9)
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
        brandUsers: function (brandService,userService) {
          var brandId = userService.userData().brands[0].id;
          return brandService.getBrandUsers(1,9,brandId)
          .then(function (data) {
            return {
              brandUsers:data.brandUsers,
              totalBrandUsers:data.brandUsersCount
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
        role: function ($stateParams) {
          return $stateParams.role;
        },
        // adminCount:function (userService) {
        //   return userService
        //   .adminCount()
        //   .then(function (data) {
        //     return data.totalAdmins
        //   })
        //   .catch(function (error) {
        //     console.log(error);
        //   })
        // }
      }
    })
    .state({
      name: "home.addUser",
      url: "/user/add/:role",
      controller: "loginSignupController",
      templateUrl: "views/addUsers.html",
      resolve: {
        authenticate: function (auth) {
          return auth.isAuthenticated();
        },
        role: function ($stateParams) {
          return $stateParams.role;
        },
        // adminCount:function (userService) {
        //   return userService
        //   .adminCount()
        //   .then(function (data) {
        //     return data.totalAdmins
        //   })
        //   .catch(function (error) {
        //     console.log(error);
        //   })
        // }
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
              socketService.emitEvent("customerJoined", data.customerData._id);
              return data.customerData;
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
  .run(function ($location, $state, $rootScope, socketService, outletService) {
    // route safety 

    var token = localStorage.getItem("token");
    $state.defaultErrorHandler(function (error) {
      console.log(error);
      // This is a naive example of how to silence the default error handler.
      $state.go("home.login")
    });

    socketService.connect();
    if (!token) {
      return;
    }

    var outletData = outletService.getServiceData().outletData;
    if (outletData) {
      console.log(outletData._id);
      socketService.emitEvent("connectOutlet", {
        brandId: outletData.brand.id
      })
    }

  })
  // .factory('$location', downgradeInjectable($locationShim));