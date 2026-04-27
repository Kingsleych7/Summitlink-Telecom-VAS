const redis = require("../config/redis");

async function getSession(phone) {
    const raw = await redis.get(phone);
    return raw ? JSON.parse(raw) : {};
}

async function saveSession(phone, data) {
    await redis.set(phone, JSON.stringify(data), "EX", 120);
}

module.exports = { getSession, saveSession };
