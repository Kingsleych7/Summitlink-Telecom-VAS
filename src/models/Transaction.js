const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    phoneNumber: String,
    type: String, // CREDIT / DEBIT
    amount: Number,
    description: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
