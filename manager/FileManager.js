var mongoose = require('mongoose');
var FileModel = require('../mongoDB/model/FileModel');
var File = require('../entity/File');
var fetch = require('node-fetch');

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

    generateFileList = async () => {
        const fileObjects = await FileModel.find();
        for (var fileObject of fileObjects) {
            this.fileList.push(new File(fileObject));
        }
        console.log('finish to load files from database');
    }

    getFileIds = () => {
        this.fileList.map(file => {
            return file._id;
        })
    }

    getObject = () => {
        return {
            _id: this._id,
            name: this.name,
            content: this.content
        }
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

    fetchData = async (url, callback) => {
        await fetch(url)
            .then(response => response.json())
            .then(json => callback(null, json))
            .catch(error => callback(error, null))
    }
}

module.exports = FileManager;