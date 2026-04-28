const sessions = new Map(); // in-memory fallback

const getSession = async (phone) => {
    return sessions.get(phone) || null;
};

const saveSession = async (phone, session) => {
    sessions.set(phone, session);
};

module.exports = { getSession, saveSession };
