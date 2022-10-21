const path = require('path');
const fs = require('fs');

const uploads_dir = init_uploads_dir();

function init_uploads_dir() {
    console.log('INFO: initializing uploads dir')    
    var destfolder = path.join(__dirname, '../uploads/')    
        
    fs.mkdir(destfolder, (err) => {
        if (err.code = 'EEXIST') {
            //console.log(destfolder + ' already exist')
        }        
    });  
    
    return destfolder
}

module.exports = {
    uploads_dir
};