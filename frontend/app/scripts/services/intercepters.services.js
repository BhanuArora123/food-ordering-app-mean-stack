

appModule.factory("intercepterService", function ($q, $state,$rootScope,$timeout) {
    var shouldIntercept = function (url) {
        var validateUrlRegex = new RegExp("localhost:8080", "i");
        return validateUrlRegex.test(url);
    }
    return {
        request: function (req) {
            if (!shouldIntercept(req.url)) {
                return req;
            }
            req.headers["Authorization"] = "Bearer " + localStorage.getItem("token");
            return req;
        },
        response: function name(res) {
            if (!shouldIntercept(res.config.url)) {
                return res;
            }
            if (res.status !== 200 && res.status !== 201) {
                return $q.reject(res);
            }
            var token = res.data.token;
            if (token) {
                localStorage.setItem("token", token);
            }
            $rootScope.error = undefined;
            $rootScope.success = res.data.message;
            // remove alert after 5 secs
            $timeout(function () {
                $rootScope.success = undefined;
            },5000);
            return res;
        },
        responseError: function (res) {
            if (!shouldIntercept(res.config.url)) {
                return res;
            }
            var errorMsg;
            if(res.data.errors){
                errorMsg = res.data.errors[0].msg;
            }
            if (res.status !== 201 && res.status !== 200) {
                console.log(res.data);
                if (res.data === 'Unauthorized' && res.status === 401) {
                    localStorage.clear();
                    $state.go("home.login");
                    alert("Unauthorized! Logging Out!");
                    return $q.reject();
                }
                
                // alert(errorMsg || res.data.message || res.data);
            }
            $rootScope.error = errorMsg || res.data.message;
            $rootScope.success = undefined;
            $timeout(function () {
                $rootScope.error = undefined;
            },5000);
            return $q.reject(res);
        }
    }
})