var path = require("path");

exports.saveFile = function (cb,file) {
    try {
        var fileName = Date.now() + file.name;
        var filePath = path.join(__dirname,"..","public",fileName);

        file.mv(filePath,function (err) {
            if(err){
                console.log(err);
                cb(err);
            }
            console.log("file uploaded successfully");
            cb(null,`http://localhost:8080/public/${fileName}`);
        })
    } catch (error) {
        console.log(error);
    }
}