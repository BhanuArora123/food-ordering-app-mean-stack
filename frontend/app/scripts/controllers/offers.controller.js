
appModule.controller("offersController", function ($scope,$rootScope, offers, utility,offerService,userService) {
    $scope.offers = offers.offers;
    $scope.totalOffers = offers.totalOffers;
    $scope.popup1 = {};
    $scope.popup2 = {};

    $scope.openCreateOfferModal = function () {
        return utility.openModal(
            'views/offers/addOffer.html',
            'addOfferController',
            'addOfferModal',
            $scope,
            {
                mode:'add'
            },
            $scope
        )
    }

    $scope.editOffer = function (offer) {
        return utility.openModal(
            'views/offers/addOffer.html',
            'addOfferController',
            'addOfferModal',
            $scope,
            {
                mode : 'edit',
                offerData:offer
            },
            $scope
        )
    }

    $scope.deleteOffer = function (offerId,index) {
        var userData = userService.userData();
        var brandData = userData.brands[$rootScope.currentBrandIndex];
        offerService
        .deleteOffer(offerId,brandData.id)
        .then(function () {
            $scope.offers.splice(index,1);
        })
        .catch(function (error) {
            console.log(error);
        })
    }

})

appModule.controller("addOfferController", function ($scope, $rootScope, offerService, userService) {
    $scope.dateOptions = {
        dateDisabled: function (data) {
            var date = data.date;
            var mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        },
        formatYear: 'yy',
        startingDay: 1,
        minDate: new Date()
    };
    $scope.openStartDate = function () {
        $scope.popup1.opened = true;
    };

    $scope.openEndDate = function () {
        $scope.popup2.opened = true;
    };

    $scope.offer = {
        orderType:"Dine In"
    };

    $scope.offerStartDate = new Date();
    var endDate = new Date(new Date().setDate($scope.offerStartDate.getDate() + 1));
    $scope.offerEndDate = endDate;

    $scope.mode = $scope.$parent.extraData.mode;

    // for edit mode 
    // console.log("mode - ",$scope.$parent.extraData.mode);
    if($scope.$parent.extraData.mode === 'edit'){

        $scope.offer = $scope.$parent.extraData.offerData;
        $scope.offerStartDate = new Date($scope.offer.startFrom);
        $scope.offerEndDate = new Date($scope.offer.validTill);
    }

    $scope.createOffer = function (offer, startDate, endDate) {
        var userData = userService.userData();
        var brandData = userData.brands[$rootScope.currentBrandIndex];
        offer.startDate = startDate;
        offer.endDate = endDate;
        offer.brand = {
            id: brandData.id,
            name: brandData.name
        };
        offerService
            .createOffer(offer)
            .then(function (data) {
                $scope.addOfferModal.close();
                $scope.$parent.offers.push(data.offerData);
            })
            .catch(function (error) {
                console.log(error);
            })
    }
    $scope.editOffer = function (offer, startDate, endDate) {
        var userData = userService.userData();
        var brandData = userData.brands[$rootScope.currentBrandIndex];
        offer.startDate = startDate;
        offer.endDate = endDate;
        offer.brand = {
            id: brandData.id,
            name: brandData.name
        };
        offerService
            .editOffer(offer)
            .then(function (data) {
                $scope.addOfferModal.close();
            })
            .catch(function (error) {
                console.log(error);
            })
    }
})