const express = require("express");
const app = express();

// Parse USSD requests
app.use(express.urlencoded({ extended: false }));

// TEST ROUTE
app.get("/", (req, res) => {
    res.send("SummitLink USSD is LIVE 🚀");
});

// USSD ROUTE (SIMPLE + STABLE)
app.post("/ussd", (req, res) => {

    console.log(req.body); // see requests in logs

    let { text = "" } = req.body;
    text = text.trim();

    let response = "";

    // MAIN MENU
    if (text === "") {
        response = "CON Welcome to SummitLink\n1. My Account\n2. Buy Data\n3. Support";
    }

    // ACCOUNT
    else if (text === "1") {
        response = "CON My Account\n1. Check Balance\n2. Wallet Info";
    }
    else if (text === "1*1") {
        response = "END Your balance is ₦1000";
    }
    else if (text === "1*2") {
        response = "END Wallet is active";
    }

    // DATA
    else if (text === "2") {
        response = "CON Buy Data\n1. 1GB - ₦300\n2. 2GB - ₦500";
    }
    else if (text === "2*1") {
        response = "END You bought 1GB";
    }
    else if (text === "2*2") {
        response = "END You bought 2GB";
    }

    // SUPPORT
    else if (text === "3") {
        response = "END Contact: support@summitlink.ng";
    }

    // INVALID
    else {
        response = "END Invalid input";
    }

    res.setHeader("Content-Type", "text/plain");
    res.send(response);
});

// SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});