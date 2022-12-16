

appModule.service("reportService", function ($http,blockUI) {
    this.getRequiredReport = function (endPoint,data) {
        blockUI.start({
            message:"generating Report..."
        })
        return $http.get("http://localhost:8080"+endPoint,{
            params:data
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
})