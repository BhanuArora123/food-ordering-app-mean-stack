// var multer = require("multer");

var path = require("path");

exports.getFileUploader = function (destinationFolder, allowedMimetypes) {
    // configuring storage of files 

    // var diskStorage = multer.diskStorage({
    //     destination: function (req, file, cb) {
    //         var imageDest = path.join(__dirname,"..",destinationFolder);
    //         cb(null, imageDest);
    //     },
    //     filename: function (req, file, cb) {
    //         var fileName = file.originalname.split(".")[0];
    //         var fileExtension = file.originalname.split(".")[1];
    //         var incomingFileName = fileName + (new Date().toISOString().replaceAll(":", "-")) + "." + fileExtension;
    //         cb(null, incomingFileName);
    //     }
    // })

    // return multer({
    //     storage:diskStorage,
    //     fileFilter: function (req,file,cb) {
    //         var isFileAllowed = allowedMimetypes.find(function (fileMimetype) {
    //             return file.mimetype === fileMimetype;
    //         })
    //         if(isFileAllowed){
    //             return cb(null,true);
    //         }
    //         cb(null,false);
    //     }
    // });
}