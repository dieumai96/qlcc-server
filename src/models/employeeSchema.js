const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var employeeSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    fullNameKhongDau: {
        type: String,
        required: true,
    },
    email : {
        type : String,
    },
    buildingID: { type: Schema.Types.ObjectId, ref: 'buildings' },
    avatar: {
        type: String
    }, password: {
        type: String
    }, note: {
        type: String
    }, phone: {
        type: String,
        required: true
    }, roles: {
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
        type: String,
    }
})

module.exports = mongoose.model("employees", employeeSchema);