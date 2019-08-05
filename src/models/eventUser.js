const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var eventUserSchema = new Schema({

    buildingID: { type: Schema.Types.ObjectId, ref: 'buildings' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'employees' },
    dataType: {
        type: String,
        required: true
    },
    userID: { type: Schema.Types.ObjectId, ref: 'employees' },
    userFlatID: { type: Schema.Types.ObjectId, ref: 'flats' },
    read: {
        type: Boolean,
        default: false
    },
    content: {
        type: String
    },
    title: {
        type: String
    },
    parentNotificationID: { type: Schema.Types.ObjectId, ref: 'employees' },
    timeCreated: {
        type: Date,
        default: Date.now,
    },
    type: {
        type: String,

    },
    dmlType: {
        type: String
    }

})

module.exports = mongoose.model("eventUser", eventUserSchema);