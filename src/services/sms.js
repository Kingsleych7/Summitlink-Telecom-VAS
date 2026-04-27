const africastalking = require("africastalking")({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});

async function sendSMS(phone, message) {
    try {
        await africastalking.SMS.send({
            to: phone,
            message
        });
        console.log("SMS sent");
    } catch (err) {
        console.log("SMS error:", err);
    }
}

module.exports = sendSMS;
