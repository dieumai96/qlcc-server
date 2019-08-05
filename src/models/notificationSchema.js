const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var notificationSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true
    },
    buildingID: { type: Schema.Types.ObjectId, ref: 'buildings' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'employees' },
    priority: {
        type: Number,
        required: true,
    },
    titleKhongDau: {
        type: String
    },
    file: {
        type: Object,
    },
    notifyScope: {
        type: Object,
    },
    timeCreated: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: Number,
        required : true,
    }
})

module.exports = mongoose.model("notifications", notificationSchema);