const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const buildingSchema = new Schema({
    address: {
        type: String,
        require: true,
    },
    blocks: {
        type: Array,
        require: true,
    },
    code: {
        type: String,
        require: true,
    },
    hotLine: {
        type: String,
        require: true,
    },
    image: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    totalFlat: {
        type: Number,
        require: true,
    },
    diaChinh: {
        type: Object,
        require: true,
    },
    createBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
})
module.exports = mongoose.model("Building", buildingSchema);