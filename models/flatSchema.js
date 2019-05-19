const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var flatSchema = new Schema({}, { strict: false })

module.exports = mongoose.model("flats", flatSchema);