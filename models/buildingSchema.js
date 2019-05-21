const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var buildingSchema = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: 'employees' },

}, { strict: false })

module.exports = mongoose.model("buildings", buildingSchema);
// createdBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
