

appModule.controller("reportsController", function ($scope, utility, permission) {
    $scope.permissionAuthorizations = permission.getPermissionAuthorizations();
    $scope.availableReports = [
        {
            name: "Brand/Outlet Items Sold Count",
            desc: "Brand Items Sold Count",
            url: "/reports/itemsSoldCount",
            id: 1,
            allowedRoles: {
                brand: 1,
                admin: 1,
                outlet: 1,
                superAdmin:1
            }
        },
        {
            name: "Brand Total Revenue",
            desc: "Brand Total Revenue",
            url: "/reports/brandRevenue",
            id: 2,
            allowedRoles: {
                brand: 1,
                admin: 1,
                superAdmin:1
            }
        },
        {
            name: "Top 3 Sold Items",
            desc: "Top 3 Sold Items",
            url: "/reports/topMaxSoldItem",
            id: 3,
            allowedRoles: {
                brand: 1,
                admin: 1,
                superAdmin:1
            }
        }
    ];
    $scope.viewReport = function (index) {
        utility.openModal("views/reports/displayModal.html", "reportModalController", "reportModal", $scope, {
            selectedReport: $scope.availableReports[index]
        }, $scope);
    }
    $scope.getRole = function () {
        return utility.getRole();
    }
    $scope.isRoleAllowed = function (report,role) {
        return report.allowedRoles[role];
    }
})

appModule.controller("reportModalController", function ($scope,$rootScope, userService, brandService, foodService, reportService, outletService, utility) {
    $scope.startDate = new Date();
    var endDate = new Date(new Date().setDate($scope.startDate.getDate() + 1));
    $scope.endDate = endDate;
    $scope.selectedReport = $scope.$parent.extraData.selectedReport;
    $scope.timeSlots = Array(24).fill(0, 0, 24).map(function (value, index) {
        return `${index}-${index + 1}`;
    });
    $scope.popup1 = {
        opened: false
    };
    $scope.popup2 = {
        opened: false
    };
    $scope.dateOptions = {
        dateDisabled: function (data) {
            var date = data.date;
            var mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        },
        formatYear: 'yy',
        startingDay: 1
    };
    $scope.openStartDate = function () {
        $scope.popup1.opened = true;
    };

    $scope.openEndDate = function () {
        $scope.popup2.opened = true;
    };

    $scope.getBrands = function (query) {
        var role = utility.getRole();
        if (role === 'brand' || role === 'outlet') {
            var userData = userService.userData();
            var brandData = userData.brands ? userData.brands[$rootScope.currentBrandIndex] : undefined;
            var outletData = userData.outlets ? userData.outlets[$rootScope.currentOutletIndex] : undefined;
            return $scope.availableBrands = [
                brandData?{
                    _id:brandData.id,
                    name:brandData.name
                } :
                {
                    _id: outletData.brand.id,
                    name: outletData.brand.name
                }
            ];
        }
        return brandService
            .getBrands(1,9,query)
            .then(function (data) {
                return data.brands;
            })
            .catch(function (error) {
                console.log(error);
            })
    }
    $scope.getOutlets = function (query,brandId) {
        var role = utility.getRole();
        if(role === 'outlet'){
            var outletData = userService.userData().outlets[$rootScope.currentOutletIndex];
            return $scope.availableOutlets = [outletData];
        }
        return outletService
            .getAllOutlets(1, 9, brandId,query)
            .then(function (data) {
                $scope.availableOutlets = data.outlets;
                return data.outlets;
            })
            .catch(function (error) {
                console.log(error);
            })
    }
    $scope.getFoodItems = function (query,brandId) {
        return foodService
            .getFoodItems({
                brandId: brandId,
                foodName:query,
                page:1,
                limit:9
            })
            .then(function (data) {
                return data.matchedFoodItems;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.updateFoodList = function (foodItems) {
        var updateFoodListDebounce = utility.debounce(1000, function () {
            $scope.foodList = foodItems.map(function (food) {
                return food._id;
            })
        })
        updateFoodListDebounce();
    }

    $scope.soldItemCountReport = function (data) {
        reportService
            .getRequiredReport($scope.selectedReport.url, {
                brandId: data.selectedBrand._id,
                outletId: data.selectedOutlet ? data.selectedOutlet._id : undefined,
                startDate: $scope.startDate,
                endDate: $scope.endDate,
                selectedFoodItems: JSON.stringify($scope.foodList),
                timezone:utility.getCurrentTimezone()
            })
            .then(function (data) {
                var chartDataMap = {};
                data.reportData.forEach(function (item) {
                    if (!chartDataMap[item.foodName]) {
                        chartDataMap[item.foodName] = Array(24).fill(0);
                    }
                    chartDataMap[item.foodName][item._id.startHour] = item.totalItems;
                })
                var chartSeries = Object.keys(chartDataMap);
                var chartData = Object.values(chartDataMap);
                $scope.chartLabels = $scope.timeSlots;
                // handling those items which are selected but not in list 
                $scope.reportData.selectedFoodItems.forEach(function (food) {
                    if (!chartDataMap[food.name]) {
                        chartSeries.push(food.name);
                        chartData.push(Array(24).fill(0, 0, 24));
                    }
                })
                $scope.chartData = chartData;
                $scope.chartSeries = chartSeries;
                console.log($scope.chartData, $scope.chartSeries);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.brandRevenueReport = function (data) {
        reportService
            .getRequiredReport($scope.selectedReport.url, {
                brandIds: JSON.stringify(data.selectedBrands.map(function (brand) {
                    return brand._id;
                })),
                startDate: $scope.startDate,
                endDate: $scope.endDate
            })
            .then(function (data) {
                console.log(data);
                $scope.chartSeries = ["series1"];
                var chartData = [];
                var chartLabels = [];
                var chartLabelsMap = {};
                data.reportData.forEach(function (brandData) {
                    chartData.push(brandData.totalRevenue);
                    chartLabels.push(brandData.brandName);
                    chartLabelsMap[brandData.brandName] = true;
                })
                $scope.reportData.selectedBrands.forEach(function (brand) {
                    if (!chartLabelsMap[brand.name]) {
                        chartLabels.push(brand.name);
                        chartData.push(0);
                    }
                })
                $scope.chartData = chartData;
                $scope.chartLabels = chartLabels;
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    $scope.getMaxSoldItems = function (data) {
        reportService
            .getRequiredReport($scope.selectedReport.url, {
                brandId: data.brandSelected._id,
                startDate: $scope.startDate,
                endDate: $scope.endDate,
                timezone:utility.getCurrentTimezone(),
                startHour:data.startHour?data.startHour.split("-")[0]:undefined
            })
            .then(function (resData) {
                $scope.maxSoldItems = resData.reportData;
            })
            .catch(function (error) {
                console.log(error);
            })
    }
})

