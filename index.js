const express = require("express");
const app = express();
const mongoose = require("mongoose");

// BODY PARSER
app.use(express.urlencoded({ extended: false }));

// MONGODB CONNECT
mongoose.connect("mongodb+srv://Summitlink:summit9876@summitlinkcluster.t4qvdqt.mongodb.net/?retryWrites=true&w=majority")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// USER MODEL
const UserSchema = new mongoose.Schema({
    phoneNumber: String,
    balance: { type: Number, default: 1000 }
});

const User = mongoose.model("User", UserSchema);

// HOME ROUTE
app.get("/", (req, res) => {
    res.send("USSD service is running 🚀");
});

// USSD ROUTE (CLEAN FIXED VERSION)
app.post("/ussd", async (req, res) => {

    console.log(req.body); // DEBUG

    let { text = "", phoneNumber } = req.body;

    text = text.trim();

    let response = "";

    // FIND OR CREATE USER
    let user = await User.findOne({ phoneNumber });

    if (!user) {
        user = await User.create({
            phoneNumber,
            balance: 1000
        });
    }

    // MENU
    if (text === "") {
        response = "CON Welcome to SummitLink\n1. My Account\n2. Buy Data\n3. Support";
    }

    else if (text === "1") {
        response = "CON My Account\n1. Check Balance\n2. Wallet Info";
    }

    else if (text === "1*1") {
        response = `END Your balance is ₦${user.balance}`;
    }

    else if (text === "2") {
        response = "CON Buy Data\n1. 1GB - ₦300\n2. 2GB - ₦500";
    }

    else if (text === "2*1") {
        if (user.balance >= 300) {
            user.balance -= 300;
            await user.save();
            response = "END You bought 1GB for ₦300";
        } else {
            response = "END Insufficient balance";
        }
    }

    else {
        response = "END Invalid input";
    }

    res.setHeader("Content-Type", "text/plain");
    res.send(response);
});

// SERVER START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("USSD running on port " + PORT);
});