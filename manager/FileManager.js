var mongoose = require('mongoose');
var FileModel = require('../mongoDB/model/FileModel');
var File = require('../entity/File');

class FileManager {

    constructor() {

    }

    init = async () => {
        this.fileList = [];
        // FileModel.watch().on('change', data => {
        //     console.log(data);
        // });
        await this.generateFileList();
    }

    getFileList = () => {
        return this.fileList;
    }

    generateFileList = async () => {
        this.fileList = [];
        const fileObjects = await FileModel.find().sort({createdAt: -1});
        for (var fileObject of fileObjects) {
            this.fileList.push(new File(fileObject));
        }
        console.log('> finish to load files from database');
    }

    fetchNewFiles = async () => {
        if (this.fileList === undefined || this.fileList.length == 0) {
            await this.generateFileList();
            return;
        }
        const fileObjects = await FileModel.find({
            createdAt: {
                $gte: new Date(this.fileList[0].createdAt)
            }
        });
        fileObjects.shift();
        for (var fileObject of fileObjects) {
            this.fileList.unshift(new File(fileObject));
        }
        console.log('> finish to fetch files from database');
    }

    insertFile = async (fileName, fileContent) => {
        let fileObject = new File({
            name: fileName,
            content: fileContent
        });
        const fileModel = new FileModel(fileObject);
        const newFile = await fileModel.save();
        console.log('> file has been inserted successfully');
    }

    updateFile = async (fileId, updatedContent) => {
        var file = this.getFileById(fileId);
        file.content = updatedContent;
        let fileObject = file.getObject();
        await FileModel.findByIdAndUpdate(fileObject._id, fileObject).exec();
        console.log('> file has been updated successfully');
    }

    // utils

    getFileById = fileId => {
        return this.fileList.filter(file => {
            return file._id.equals(fileId);
        })[0]
    }

    getFileIds = () => {
        this.fileList.map(file => {
            return file._id;
        })
    }
}

module.exports = FileManager;