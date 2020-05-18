class File {

    // props = {id, name, content}
    constructor(fileObject) {
        for (var prop in fileObject) {
            this[prop] = fileObject[prop]
        }
    }

    getContent = () => {
        return this.content;
    }
}

module.exports = File;