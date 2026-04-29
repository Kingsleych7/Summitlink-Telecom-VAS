require("dotenv").config();

const Queue = require("bull");
const airtimeQueue = new Queue("airtime", process.env.REDIS_URL);
console.log("Worker disabled for now");
airtimeQueue.process(async (job) => {
    const { phone, amount } = job.data;

    console.log("Processing airtime:", phone, amount);

    // call your function
    // await buyAirtime(phone, amount);
});
