

appModule.factory("auth", function ($q) {
    return {
        isAuthenticated: function () {
            var token = localStorage.getItem("token");
            if (!token) {
                return $q.reject("Not Authenticated")
            }
        }
    }
})