var { writeFile } = require('../helper/fileSystemHelper');

class FileController {

    constructor(fileManager) {
        this.fileManager = fileManager;
    }

    fetchFiles = async() => {
        await this.fileManager.fetchNewFiles();
        return this.fileManager.getFileList();
    }
    
    enterFile = async (name, content) => {
        await this.fileManager.insertFile(name, content);
        // write to disk
        writeFile(name, content, (err) => {
            if (err) throw err;
            console.log('> Write File to Disk.');
        });
    }

    updateFile = async (fileId, name, updatedContent) => {
        await this.fileManager.updateFile(fileId, updatedContent);
        // update to disk
        writeFile(name, updatedContent, (err) => {
            if (err) throw err;
            console.log('> Update File to Disk.');
        });
    }

    getFileById = fileId => {
        return this.fileManager.getFileById(fileId);
    }
}

module.exports = FileController;