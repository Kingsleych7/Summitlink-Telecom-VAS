const User = require("../models/User");

/**
 * Get existing user or create new one
 */
const getOrCreateUser = async (phoneNumber) => {
    try {
        let user = await User.findOne({ phoneNumber });

        if (!user) {
            user = await User.create({
                phoneNumber,
                balance: 1000,
                pin: "1234"
            });
        }

        return user;

    } catch (err) {
        console.log("USER SERVICE ERROR:", err);
        throw err;
    }
};

module.exports = { getOrCreateUser };
