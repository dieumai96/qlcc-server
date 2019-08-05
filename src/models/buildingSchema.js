const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var buildingSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true

    },
    code: {
        type: String,
        required: true,
    },
    hotLine: {
        type: String,
        required: true

    },
    blocks: {
        type: Array,
        required: true

    },
    address: {
        type: String,
        required: true
    },
    roles: {
        type: Object
    },
    status: {
        type: Number
    },
    timeCreated: {
        type: Date,
        default: Date.now,
    },
    currentDate : {
        type : Date,
    },
    totalFlat: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("buildings", buildingSchema);