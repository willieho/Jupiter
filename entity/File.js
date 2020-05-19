class File {

    // props = {_id, name, content}
    constructor(fileObject) {
        for (var prop in fileObject) {
            this[prop] = fileObject[prop]
        }
    }

    getContent = () => {
        return this.content;
    }

    getObject = () => {
        return {
            _id: this._id,
            name: this.name,
            content: this.content
        }
    }
}

module.exports = File;