var fs = require('fs');
const path = './local_file_storage/'
const fileType = '.txt'

if (!fs.existsSync(path)) {
    fs.mkdir(path, (err) => {
        if (err) throw err;
        console.log("> Create local_file_storage directory.")
    });
}

module.exports = (fileName, content, callback) => {
    fs.writeFile(path + fileName + fileType, content, callback);
};