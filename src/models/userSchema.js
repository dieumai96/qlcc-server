const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    fullNameKhongDau: {
        type: String,
    },
    email: {
        type: String,
    },
    buildingID: { type: Schema.Types.ObjectId, ref: 'buildings' },
    flatID: { type: Schema.Types.ObjectId, ref: 'flats' },
    avatar: {
        type: String
    }, password: {
        type: String
    }, note: {
        type: String
    }, phone: {
        type: String,
        required: true
    }, soPhong: {
        type: Object
    }, status: {
        type: Number
    }, timeCreated: {
        type: Date,
        default: Date.now,
    },
    birthDate: {
        type: Number,
    },
    userType: {
        type: String
    }
})

module.exports = mongoose.model("users", userSchema);