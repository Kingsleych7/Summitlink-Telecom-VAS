const Queue = require("bull");

// ⚠️ For now using REDIS_URL (Render or Upstash later)
const airtimeQueue = new Queue("airtime", process.env.REDIS_URL);

// Worker
airtimeQueue.process(async (job) => {
    try {
        const { phoneNumber, amount } = job.data;

        console.log("Processing airtime:", phoneNumber, amount);

        // TODO: integrate real airtime API here
        return { success: true };

    } catch (err) {
        console.log("QUEUE ERROR:", err);
        throw err;
    }
});

module.exports = airtimeQueue;
