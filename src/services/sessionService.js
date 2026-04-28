const redis = require("../config/redis");

const getSession = async (phone) => {
    try {
        const data = await redis.get(phone);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.log("Session get error:", err);
        return null;
    }
};

const saveSession = async (phone, session) => {
    try {
        await redis.set(phone, JSON.stringify(session), "EX", 300);
    } catch (err) {
        console.log("Session save error:", err);
    }
};

module.exports = { getSession, saveSession };
