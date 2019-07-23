const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var rolesSchema = new Schema({

    buildingID: { type: Schema.Types.ObjectId, ref: 'buildings' },
    code: {
        type: String,
        required: true,
    },

    name: {
        type: String,
        required: true,
    },

    timeCreated: {
        type: Date,
        default: Date.now,
    },
    status : {
        type : Number,
    }
})

module.exports = mongoose.model("roles", rolesSchema);