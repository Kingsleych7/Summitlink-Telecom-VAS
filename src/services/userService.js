const User = require("../../models/User");

const getOrCreateUser = async (phone) => {
    let user = await User.findOne({ phoneNumber: phone });

    if (!user) {
        user = await User.create({
            phoneNumber: phone,
            balance: 1000,
            pin: "1234"
        });
    }

    return user;
};

module.exports = { getOrCreateUser };
