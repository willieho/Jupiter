var fs = require('fs');
const DIRECTORY_NAME = 'local_file_storage';
const PATH = './local_file_storage/'
const FILE_TYPE = '.txt'

if (!fs.existsSync(PATH)) {
    fs.mkdir(PATH, (err) => {
        if (err) throw err;
        console.log("> Create local_file_storage directory.")
    });
}

module.exports = {
    writeFile: (fileName, content, callback) => {
        fs.writeFile(PATH + fileName + FILE_TYPE, content, callback);
    },
    DIRECTORY_NAME: DIRECTORY_NAME,
    FILE_TYPE: FILE_TYPE
};