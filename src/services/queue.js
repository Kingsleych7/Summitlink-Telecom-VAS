const Queue = require("bull");

const airtimeQueue = new Queue("airtime", process.env.REDIS_URL);

module.exports = airtimeQueue;
