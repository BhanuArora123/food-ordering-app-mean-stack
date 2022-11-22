

exports.convertToArray = function (obj) {
    return Object.keys(obj).map(function (keys) {
        return obj[keys];
    });
}