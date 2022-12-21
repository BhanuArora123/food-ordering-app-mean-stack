

appModule.config(function ($stateProvider, $httpProvider, $urlRouterProvider, blockUIConfig,oiSelectProvider) {

  oiSelectProvider.options.debounce = 500;
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
        },
        profilePath: function (utility) {
          var role = utility.getRole();
          if (role !== 'brand' && role !== 'outlet') {
            role = 'admin';
          }
          return `home.${role}.display`;
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
        availableCategories:function (foodService) {
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
        brandsData: function (adminService) {
          return adminService
            .getBrands(1,9)
            .then(function (data) {
              return {
                allBrands:data.brands,
                totalBrands:data.totalBrands
              };
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
        outletOrders: function (orderService, brandService, outletService) {
          var brandData = brandService.getServiceData().brandData;
          var outletData = outletService.getServiceData().outletData;
          console.log(brandData, outletData);
          var brandId = brandData ? brandData._id : outletData.brand.id;
          var outletId = outletData ? outletData._id : undefined;
          return orderService
            .getAllOrders(undefined,"Dine In",undefined,1,9)
            .then(function (data) {
              return {
                orders:data.orders,
                totalOrders:data.totalOrders
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
              return {
                tablesData:data.tables,
                totalTables:data.totalTables
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
        outletsData: function (brandService) {
          return brandService
            .getAllOutlets(1, 9)
            .then(function (data) {
              return {
                allOutlets:data.outlets,
                totalOutlets:data.totalOutlets
              };
            })
            .catch(function (error) {
              console.log(error);
            })
        },
        customersData: function (customerService) {
          return customerService
            .getAllCustomers(1,9)
            .then(function (data) {
              return {
                allCustomers : data.customers,
                totalCustomers:data.totalCustomers
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
      abstract:true,
      templateUrl:"views/customer/index.html"
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
        customerData: function (customerService,socketService) {
          return customerService
            .getCustomerByPhone()
            .then(function (data) {
              socketService.emitEvent("customerJoined",data.customerData._id);
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