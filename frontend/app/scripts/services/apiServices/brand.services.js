'use-strict';

// user service
appModule
    .service("brandService", function ($http, $state, blockUI) {
        this.getBrands = function (page,limit,search) {
            return $http.get("http://localhost:8080/brand/getAll", {
                params:{
                    page: page,
                    limit: limit,
                    search:search
                }
            })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        };
        this.getBrandUsers = function (page, limit,brandId,subRole,query) {
            return $http
                .get("http://localhost:8080/brand/users/get",{
                    params:{
                        brandId:brandId,
                        page:page,
                        limit:limit,
                        subRole:subRole,
                        search:query
                    }
                })
                .then(function (res) {
                    return res.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
        this.editBrand = function (brand) {
            blockUI.start({
                message:"Editing Brand...."
            })
            return $http
                .put("http://localhost:8080/brand/edit", {
                    brandId: brand._id,
                    name: brand.name,
                    isDisabled:brand.isDisabled
                })
                .then(function (res) {
                    blockUI.stop();
                    return res.data;
                })
                .catch(function (error) {
                    blockUI.stop();
                    console.log(error);
                })
        };
        this.sendInstructionsToOutlets = function (title, content) {
            blockUI.start({
                message: "Sending Instructions..."
            })
            return $http.post("http://localhost:8080/brand/sendInstructions", {
                title: title,
                content: content
            })
                .then(function (res) {
                    blockUI.stop();
                    return res.data;
                })
                .catch(function (error) {
                    blockUI.stop();
                    console.log(error);
                })
        }
    })