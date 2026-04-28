// src/ussd/ussdController.js

const { getSession, saveSession } = require("../utils/session");
const { getRequestId } = require("../utils/idempotency");
const sendSMS = require("../services/sms");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
    try {

        const { phoneNumber, text = "" } = req.body;

        const normalizedPhone = normalizePhone(phoneNumber);
        const input = (text || "").trim();

        // ======================
        // LOAD SESSION FIRST
        // ======================
        let session = await getSession(normalizedPhone) || {
            state: "PIN",
            data: {}
        };

        console.log("SESSION:", session.state);
        console.log("INPUT:", input);

        // ======================
        // FIRST SCREEN
        // ======================
        if (text === "") {
            return res.send("CON Enter your 4-digit PIN:");
        }

        // ======================
        // IDEMPOTENCY
        // ======================
        const reqId = getRequestId(phoneNumber, text);

        if (session.lastReq === reqId) {
            return res.send("END Duplicate request");
        }

        session.lastReq = reqId;

        // ======================
        // GET USER (FIXED)
        // ======================
        let user = await User.findOne({ phoneNumber: normalizedPhone });

        if (!user) {
            user = await User.create({
                phoneNumber: normalizedPhone,
                email: normalizedPhone + "@test.com",
                balance: 1000,
                pin: "1234" // TEMP FIX (NO bcrypt here)
            });
        }

        // ======================
        // BACK NAVIGATION
        // ======================
        if (text === "00") {
            session.state = "MENU";
            await saveSession(normalizedPhone, session);

            return res.send(`CON Welcome back
1. Check Balance
2. Buy Airtime
3. Buy Data
4. Fund Wallet
5. Transactions`);
        }

    } catch (err) {
        console.log("🔥 USSD ERROR:", err);
        console.log(err?.stack);

        return res.send("END System error");
    }
};

        // ======================
        // STATE MACHINE
        // ======================

        // PIN
        if (session.state === "PIN") {

    if (!text) {
        return res.send("CON Enter your 4-digit PIN:");
    }

    let isValid = false;

    if (user.pin.length === 4) {
        isValid = (text === user.pin);
    } else {
        isValid = await bcrypt.compare(text, user.pin);
    }

    if (!isValid) {
        return res.send("END ❌ Incorrect PIN");
    }

    // ✅ IMPORTANT: MOVE STATE
    session.state = "MAIN_MENU";
    saveSession(normalizedPhone, session);

    return res.send(`CON Welcome to SummitLink
1. Check Balance
2. Buy Airtime
3. Buy Data
4. Fund Wallet
5. Transactions`);
}

        // MENU
 if (session.state === "MAIN_MENU") {

    if (text === "1") {
        return res.send(`END Balance: ₦${user.balance}`);
    }

    if (text === "2") {
        session.state = "AIRTIME";
        saveSession(normalizedPhone, session);
        return res.send("CON Enter amount:");
    }

    if (text === "3") {
        session.state = "DATA";
        saveSession(normalizedPhone, session);
        return res.send("CON Select data plan");
    }

    if (text === "4") {
        return res.send(`END 💳 Fund Wallet
https://your-backend.onrender.com/paystack/pay/${phoneNumber}/1000`);
    }

    if (text === "5") {
        const txs = await Transaction.find({ phoneNumber })
            .sort({ createdAt: -1 })
            .limit(3);

        if (!txs.length) {
            return res.send("END No transactions");
        }

        let msg = "END Recent Transactions:\n";
        txs.forEach(t => {
            msg += `${t.type} ₦${t.amount}\n`;
        });

        return res.send(msg);
    }

    // ✅ THIS IS WHAT YOU WERE MISSING
    return res.send(`CON Invalid option
1. Check Balance
2. Buy Airtime
3. Buy Data
4. Fund Wallet
5. Transactions`);
}

        // AIRTIME
        if (session.state === "AIRTIME") {

    const amount = Number(text);

    if (!amount || amount <= 0) {
        return res.send("CON Enter valid amount:");
    }

    if (user.balance < amount) {
        return res.send("END ❌ Insufficient balance");
    }

    user.balance -= amount;
    await user.save();

    session.state = "MAIN_MENU";
    saveSession(normalizedPhone, session);

    return res.send("END ✅ Airtime successful");
}

        // DATA
        if (session.state === "DATA") {

            const option = text;

            let amount = 0;
            let plan = "";

            if (option === "1") { amount = 300; plan = "1GB"; }
            if (option === "2") { amount = 500; plan = "2GB"; }
            if (option === "3") { amount = 1200; plan = "5GB"; }

            if (user.balance < amount) {
                return res.send("END ❌ Insufficient balance");
            }

            user.balance -= amount;
            await user.save();

            await Transaction.create({
                phoneNumber,
                type: "DEBIT",
                amount,
                description: plan
            });

            await sendSMS(phoneNumber, `${plan} purchased`);

            session.state = "PIN";
            await saveSession(phoneNumber, session);

            return res.send(`END ✅ ${plan} successful`);
        }

        return res.send("END Invalid");

    catch (err) {
    console.log("🔥 USSD FULL ERROR:");
    console.log(err);
    console.log(err?.stack);

    return res.send("END System error");
}
