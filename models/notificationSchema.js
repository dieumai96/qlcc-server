const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var notificationSchema = new Schema({
    buildingID: { type: Schema.Types.ObjectId, ref: 'buildings' },


}, { strict: false })

module.exports = mongoose.model("notifications", notificationSchema);