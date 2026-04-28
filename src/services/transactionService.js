const Transaction = require("../../models/Transaction");

/**
 * Get last 3 transactions for a user
 */
const getRecentTransactions = async (phoneNumber) => {
    try {
        return await Transaction.find({ phoneNumber })
            .sort({ createdAt: -1 })
            .limit(3);

    } catch (err) {
        console.log("TRANSACTION SERVICE ERROR:", err);
        return [];
    }
};

module.exports = { getRecentTransactions };
