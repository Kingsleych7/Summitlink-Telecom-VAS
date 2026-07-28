const User = require("../models/User");
const Transaction = require("../models/Transaction");

const bcrypt = require("bcryptjs"); // ✅ use bcryptjs (works in Termux)
const { generateRequestId } = require("../utils/requestId");

const { getSession, saveSession } = require("../services/sessionService");
const { getOrCreateUser } = require("../services/userService");
const airtimeQueue = require("../queues/airtimeQueue");
const dataQueue = require("../queues/dataQueue");
const { normalizePhone } = require("../utils/phone");
module.exports = async (req, res) => {
    try {

        // ======================
        // 1. REQUEST DATA
        // ======================
        console.log("BODY:", req.body);

        const { phoneNumber, text = "" } = req.body;

       if (!phoneNumber) {
    console.log("❌ phoneNumber missing");
    return res.send("END Missing phone number");
}
        const input = text ? text.split("*").pop().trim() : "";
        const normalizedPhone = normalizePhone(phoneNumber);

        console.log("TEXT:", text);
        console.log("INPUT:", input);
        console.log("STATE:", session.state);
        console.log("📩 USSD REQUEST:", { normalizedPhone, input });

        // ======================
        // 2. LOAD SESSION
        // ======================
        let session = await getSession(normalizedPhone);

if (!session) {
    session = {
        state: "PIN",
        data: {}
    };
}
       console.log("SESSION:", session.state); // ✅ safe

        // ======================
        // 3. IDEMPOTENCY (PREVENT DOUBLE REQUESTS)
        // ======================
        const reqId = generateRequestId(normalizedPhone, input);

        if (session.lastReq === reqId) {
            return res.send("END Duplicate request");
        }

        session.lastReq = reqId;

        // ======================
        // 4. LOAD USER
        // ======================
        const { getOrCreateUser } = require("../services/userService");

        let user = await getOrCreateUser(normalizedPhone);

        if (!user) {
            user = await User.create({
                phoneNumber: normalizedPhone,
                email: normalizedPhone + "@test.com",
                balance: 1000,
                pin: "1234" // TEMP (upgrade later to bcrypt properly)
            });
        }

        // ======================
        // 5. FIRST SCREEN (PIN ENTRY)
        // ======================
        if (input === "") {
            session.state = "PIN";
            await saveSession(normalizedPhone, session);

            return res.send("CON Enter your 4-digit PIN:");
        }

        // ======================
        // 6. PIN VALIDATION
        // ======================
       if (session.state === "PIN") {

    if (input !== user.pin) {
        return res.send("END Invalid PIN");
    }

    session.state = "MENU";
    await saveSession(normalizedPhone, session);

    return res.send(`CON Welcome
1. Check Balance
2. Buy Airtime
3. Buy Data
4. Fund Wallet
5. Transactions`);
}
     if (session.state === "AIRTIME") {

    const amount = parseInt(input);

    if (!amount || amount <= 0) {
        return res.send("END Invalid amount");
    }

    console.log("Airtime:", amount);

    session.state = "MENU";
    await saveSession(normalizedPhone, session);

    return res.send("END Airtime request received");
}


     if (session.state === "DATA") {

    let plan;

    if (input === "1") plan = "1GB";
    else if (input === "2") plan = "2GB";
    else if (input === "3") plan = "5GB";
    else return res.send("END Invalid plan");

    console.log("Data:", plan);

    session.state = "MENU";
    await saveSession(normalizedPhone, session);

    return res.send("END Data request received");
}

        // ======================
        // 7. MAIN MENU
        // ======================
       if (session.state === "MENU") {

    console.log("👉 MENU BLOCK REACHED");

    switch (input) {

        case "1":
            return res.send(`END Balance: ₦${user.balance}`);

        case "2":
            session.state = "AIRTIME";
            await saveSession(normalizedPhone, session);
            return res.send("CON Enter airtime amount");

        case "3":
            session.state = "DATA";
            await saveSession(normalizedPhone, session);
            return res.send(`CON Select plan:
1. 1GB - ₦300
2. 2GB - ₦500
3. 5GB - ₦1200`);

        case "4":
            return res.send(
                `END Fund Wallet:
https://summitlink-backend.onrender.com/paystack/pay/${normalizedPhone}/1000`
            );

        case "5":
            return res.send("END Transactions coming soon");

        default:
            return res.send("END Invalid option");
    }
}


      if (session.state === "AIRTIME") {
    const amount = parseInt(input);

    if (!amount) return res.send("END Invalid amount");

    session.state = "MENU";
    await saveSession(normalizedPhone, session);

    return res.send("END Airtime request received");
}

        // ======================
        // 8. FALLBACK
        // ======================
        return res.send("END Invalid request");


    } catch (err) {
        console.log("❌ FULL ERROR:", err);
        console.log("❌ MESSAGE:", err.message);
        console.log("❌ STACK:", err.stack);

        return res.send("END System error");
    }
};
