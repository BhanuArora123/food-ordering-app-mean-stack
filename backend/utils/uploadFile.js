// var multer = require("multer");

// var path = require("path");

// exports.getFileUploader = function (destinationFolder, allowedMimetypes) {
//     try {
//         // configuring storage of files 

//         var diskStorage = multer.diskStorage({
//             destination: function (req, file, cb) {
//                 console.log("hey!");
//                 var imageDest = path.join(__dirname, "..", destinationFolder);
//                 cb(null, imageDest);
//             },
//             filename: function (req, file, cb) {
//                 console.log("hey1!");
//                 var fileName = file.originalname.split(".")[0];
//                 var fileExtension = file.originalname.split(".")[1];
//                 var incomingFileName = fileName + (new Date().toISOString().replace(/:/g, "-")) + "." + fileExtension;
//                 cb(null, incomingFileName);
//             }
//         })

//         return multer({
//             storage: diskStorage,
//             fileFilter: function (req, file, cb) {
//                 var isFileAllowed = allowedMimetypes.find(function (fileMimetype) {
//                     return file.mimetype === fileMimetype;
//                 })
//                 if (isFileAllowed) {
//                     return cb(null, true);
//                 }
//                 cb(null, false);
//             }
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }