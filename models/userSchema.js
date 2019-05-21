const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var userSchema = new Schema({
    buildingID: { type: Schema.Types.ObjectId, ref: 'buildings' },
    flatID: { type: Schema.Types.ObjectId, ref: 'flats' },

}, { strict: false })

module.exports = mongoose.model("users", userSchema);
