const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var flatSchema = new Schema({
    block: {
        type: String,
        required: true,
    },
    buildingID: { type: Schema.Types.ObjectId, ref: 'buildings' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'employees' },
    soPhong: {
        type: String,
        required: true,
    },
    phone: {
        type: String
    }, note: {
        type: String
    },
    owerName: {
        type: String,
        required: true
    },
    flatType: {
        type: Number
    },
    status: {
        type: Number
    },
    acreage: {
        type: Number,
        required: true
    },
    timeCreated: {
        type: Date,
        default: Date.now,
    },
    code: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model("flats", flatSchema);