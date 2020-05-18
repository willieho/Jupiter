class FileController {

    constructor(fileManager) {
        this.fileManager = fileManager;
    }
    
    enterFile = async (name, content) => {
        await this.fileManager.insertFile(name, content);
    }
}

module.exports = FileController;