

appModule
    .service("offerService", function ($http) {
        this.createOffer = function (offer) {
            return $http.post("http://localhost:8080/offer/create", {
                offerName: offer.name,
                offerDiscount: offer.discount,
                offerDescription: offer.description,
                brand: offer.brand,
                startDate: offer.startDate,
                endDate: offer.endDate,
                maximumUse: offer.maximumUse,
                orderType:offer.orderType
            })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        };
        this.applyCoupon = function (offerId, outletId, brandId, customerId,orderType) {
            return $http.post("http://localhost:8080/offer/applyCoupon", {
                offerId: offerId,
                outletId: outletId,
                brandId: brandId,
                customerId: customerId,
                orderType:orderType
            })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        };
        this.getOffersForBrand = function (page, limit, brandId) {
            return $http.get("http://localhost:8080/offer/get", {
                params: {
                    page: page,
                    limit: limit,
                    brandId: brandId
                }
            })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        };
        this.getAllApplicableOffers = function (page, limit, brandId, outletId, customerId,orderType) {
            return $http.get("http://localhost:8080/offer/applicableOffers", {
                params: {
                    page: page,
                    limit: limit,
                    brandId: brandId,
                    outletId: outletId,
                    customerId: customerId,
                    orderType:orderType
                }
            })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        };
        this.editOffer = function (offer) {
            return $http.put("http://localhost:8080/offer/edit", {
                offerId:offer._id,
                discount: offer.discount,
                description: offer.description,
                brandId: offer.brand.id,
                startDate: offer.startDate,
                endDate: offer.endDate,
                maximumUse: offer.maximumUse,
                orderType:offer.orderType
            })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        };
        this.deleteOffer = function (offerId, brandId) {
            return $http.delete("http://localhost:8080/offer/delete", {
                params: {
                    offerId: offerId,
                    brandId: brandId
                }
            })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        };
    })