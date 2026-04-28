const Queue = require("bull");

const dataQueue = new Queue("data", process.env.REDIS_URL);

dataQueue.process(async (job) => {
    try {
        const { phoneNumber, plan } = job.data;

        console.log("Processing DATA purchase:", phoneNumber, plan);

        // TODO: integrate real data API here
        return { success: true };

    } catch (err) {
        console.log("DATA QUEUE ERROR:", err);
        throw err;
    }
});

module.exports = dataQueue;
