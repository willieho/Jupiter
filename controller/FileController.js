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

        // TODO: write to disk
    }

    updateFile = async (fileId, updatedContent) => {
        this.fileManager.updateFile(fileId, updatedContent);
        // TODO: update to disk
    }
}

module.exports = FileController;