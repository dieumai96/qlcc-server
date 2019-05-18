const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var employeeSchema = new Schema({}, { strict: false })

module.exports = mongoose.model("Employee", employeeSchema);