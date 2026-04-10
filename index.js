const express = require("express");
const app = express();

// IMPORTANT: parse USSD form data
app.use(express.urlencoded({ extended: false }));

// TEST ROUTE (for browser check)
app.get("/", (req, res) => {
    res.send("USSD service is running 🚀");
});

// USSD ROUTE
app.post("/ussd", (req, res) => {
    const { text = "", sessionId, phoneNumber } = req.body;

    console.log("USSD Request:", req.body);

    let response = "";

    try {

        // MAIN MENU
        if (text === "") {
            response = "CON Welcome to SummitLink\n1. My Account\n2. Buy Data\n3. Support";
        }

        // MY ACCOUNT
        else if (text === "1") {
            response = "CON My Account\n1. Check Balance\n2. Wallet Info";
        }
        else if (text === "1*1") {
            response = "END Your balance is ₦500";
        }
        else if (text === "1*2") {
            response = "END Wallet active - User Verified";
        }

        // BUY DATA
        else if (text === "2") {
            response = "CON Buy Data\n1. 1GB - ₦300\n2. 2GB - ₦500\n3. 5GB - ₦1200";
        }
        else if (text === "2*1") {
            response = "END 1GB purchased successfully for ₦300";
        }
        else if (text === "2*2") {
            response = "END 2GB purchased successfully for ₦500";
        }
        else if (text === "2*3") {
            response = "END 5GB purchased successfully for ₦1200";
        }

        // SUPPORT
        else if (text === "3") {
            response = "END Contact Support: support@summitlink.ng";
        }

        // INVALID INPUT
        else {
            response = "END Invalid input. Try again.";
        }

        // IMPORTANT: Africa's Talking requires plain text
        res.setHeader("Content-Type", "text/plain");
        res.send(response);

    } catch (error) {
        console.log("USSD Error:", error);
        res.setHeader("Content-Type", "text/plain");
        res.send("END Service temporarily unavailable");
    }
});

// PORT (Render uses process.env.PORT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("USSD server running on port " + PORT);
});
