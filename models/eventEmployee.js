const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var eventEmployeeSchema = new Schema({}, { strict: false })

module.exports = mongoose.model("eventEmployees", eventEmployeeSchema);