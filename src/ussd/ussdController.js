const User = require("../models/User");
const Transaction = require("../models/Transaction");

const { getSession, saveSession } = require("../services/sessionService");
const { getOrCreateUser } = require("../services/userService");
const airtimeQueue = require("../queues/airtimeQueue");
const dataQueue = require("../queues/dataQueue");
const { normalizePhone } = require("../utils/phone");
const { generateRequestId } = require("../utils/requestId");

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

        const normalizedPhone = normalizePhone(phoneNumber);
        const input = text.trim();

        console.log("📩 USSD REQUEST:", { normalizedPhone, input });

        // ======================
        // 2. LOAD SESSION
        // ======================
        let session = await getSession(normalizedPhone) || {
            state: "PIN",
            data: {}
        };

       console.log("SESSION:", session.state); // ✅ safe

        // ======================
        // 3. IDEMPOTENCY (PREVENT DOUBLE REQUESTS)
        // ======================
        const reqId = getRequestId(normalizedPhone, input);

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

            const isValid = await bcrypt.compare(input, user.pin);

            if (!isValid) {
            return res.send("END Invalid PIN");
           }

            session.state = "MENU";
            await saveSession(normalizedPhone, session);

            return res.send(`CON Welcome to SummitLink
1. Check Balance
2. Buy Airtime
3. Buy Data
4. Fund Wallet
5. Transactions`);
        }

        // ======================
        // 7. MAIN MENU
        // ======================
        if (session.state === "MENU") {

    switch (input) {

        case "1":
            return res.send(`END Balance: ₦${user.balance}`);

        case "2":
            if (session.state === "AIRTIME") {

    const amount = parseInt(input);

    if (!amount || amount <= 0) {
        return res.send("END Invalid amount");
    }

    await airtimeQueue.add({
        phoneNumber: normalizedPhone,
        amount
    });

    session.state = "MENU";
    await saveSession(normalizedPhone, session);

    return res.send("END Airtime request is being processed");
}

       case "3":
     if (session.state === "DATA") {

    let plan;

    switch (input) {
        case "1":
            plan = "1GB - ₦300";
            break;
        case "2":
            plan = "2GB - ₦500";
            break;
        case "3":
            plan = "5GB - ₦1200";
            break;
        default:
            return res.send("END Invalid plan selected");
    }

    await dataQueue.add({
        phoneNumber: normalizedPhone,
        plan
    });

    session.state = "MENU";
    await saveSession(normalizedPhone, session);

    return res.send("END Data purchase is being processed");
}


        case "4":
            return res.send(
                `END Fund Wallet:
https://your-backend.onrender.com/paystack/pay/${normalizedPhone}/1000`
            );

        case "5":
            const txs = await getRecentTransactions(normalizedPhone);

            if (!txs.length) {
                return res.send("END No transactions");
            }

            let msg = "END Recent Transactions:\n";

            txs.forEach(t => {
                msg += `${t.type} ₦${t.amount}\n`;
            });

            return res.send(msg);

        default:
            return res.send("END Invalid option");
    }
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
