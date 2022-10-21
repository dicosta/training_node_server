const multer = require('multer');
const uploads_config = require("../config/uploads.config");
const path = require('path')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploads_config.uploads_dir)
    },
    filename: function (req, file, cb) {
        var ext = path.extname(file.originalname);
        cb(null, file.fieldname + '_' + req.userId + '_' + Date.now() + ext)
    }
})

var filefilter = function (req, file, callback) {
        var ext = path.extname(file.originalname);

        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    }


//create multer instance
var upload = multer({ storage: storage, 
    fileFilter: filefilter })


module.exports = {upload}