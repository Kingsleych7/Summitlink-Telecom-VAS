const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { getSession, saveSession } = require("../services/sessionService");
const { getOrCreateUser } = require("../services/userService");
const Transaction = require("../models/Transaction");

const { normalizePhone } = require("../utils/phone");
const { generateRequestId } = require("../utils/requestId");

module.exports = async (req, res) => {
    try {

        // ======================
        // 1. REQUEST DATA
        // ======================
        const { phoneNumber, text = "" } = req.body;

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

            const isValid = input === user.pin; // simple first (stable)

            if (!isValid) {
                return res.send("END ❌ Invalid PIN");
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
                    session.state = "AIRTIME";
                    await saveSession(normalizedPhone, session);
                    return res.send("CON Enter airtime amount:");

                case "3":
                    session.state = "DATA";
                    await saveSession(normalizedPhone, session);
                    return res.send(`CON Select plan:
1. 1GB - ₦300
2. 2GB - ₦500
3. 5GB - ₦1200`);

                case "4":
                    return res.send(`END Fund Wallet:
https://your-backend.onrender.com/paystack/pay/${normalizedPhone}/1000`);

                case "5":
                    const txs = await Transaction.find({ phoneNumber: normalizedPhone })
                        .sort({ createdAt: -1 })
                        .limit(3);

                    if (!txs.length) return res.send("END No transactions");

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
        console.log("🔥 USSD ERROR:");
        console.log(err);
        console.log(err?.stack);

        return res.send("END System error");
    }
};
