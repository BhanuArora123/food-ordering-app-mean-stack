

appModule.factory("intercepterService",function ($q) {
    var shouldIntercept = function (url) {
        var validateUrlRegex = new RegExp("localhost:8080","i");
        return validateUrlRegex.test(url);
    }
    return {
        request:function (req) {
            if(!shouldIntercept(req.url)){
                return req;
            }
            req.headers["Authorization"] = "Bearer "+localStorage.getItem("token");
            return req;
        },
        response:function name(res) {
            if(!shouldIntercept(res.config.url)){
                return res;
            }
            if(res.status !== 200 && res.status !== 201){
                alert(res.data.message);
                return $q.reject(res);
            }
            var token = res.data.token;
            if(token){
                localStorage.setItem("token",token);
            }
            return res;
        },
        responseError:function (res) {
            if(!shouldIntercept(res.config.url)){
                return res;
              }
              if(res.status !==201 && res.status !== 200){
                alert(res.data.message);
              }
              return $q.reject(res);
        }
    }
})