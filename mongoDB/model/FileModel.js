var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fileSchema = new Schema({
    name: String,
    content: String
}, {
    collection: 'File'
});

module.exports = mongoose.model('File', fileSchema);