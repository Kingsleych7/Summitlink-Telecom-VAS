const Queue = require("bull");

let airtimeQueue = null;

if (process.env.REDIS_URL) {
    airtimeQueue = new Queue("airtime", process.env.REDIS_URL);

    airtimeQueue.process(async (job) => {
        const { phoneNumber, amount } = job.data;

        console.log("Processing airtime:", phoneNumber, amount);

        return { success: true };
    });

} else {
    console.log("⚠️ Redis not configured — using fallback");
}

module.exports = airtimeQueue;
