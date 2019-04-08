const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const employeeSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'full name is required']
    },
    phone: {
        type: String,
        required: [true, "phone is required"],
    },
    email: {
        type: String,
    },
    birthDay: {
        type: String,
    },
    avatar: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    note: {
        type: String,
    },

})
module.exports = mongoose.model("Employee", employeeSchema);