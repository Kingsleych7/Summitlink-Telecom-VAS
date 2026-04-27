const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    phoneNumber: { type: String, unique: true },
    email: String,
    balance: { type: Number, default: 0 },
    pin: { type: String, default: "1234" }
});

module.exports = mongoose.model("User", UserSchema);
