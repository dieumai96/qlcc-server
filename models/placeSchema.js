const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var placeSchema = new Schema({}, { strict: false })

module.exports = mongoose.model("place", employeeSchema);