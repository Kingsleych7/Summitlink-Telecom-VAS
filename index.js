require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
<<<<<<< HEAD
=======
const axios = require("axios");
const crypto = require("crypto");

const redis = require("./src/config/redis");
const PORT = process.env.PORT || 10000;

const { getRequestId } = require("./src/utils/idempotency");

const airtimeQueue = require("./src/services/queue");

const sendSMS = require("./src/services/sms");
>>>>>>> e47d5ba (updated USSD controller and fixes)

const ussdController = require("./src/ussd/ussdController");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// USSD route
app.post("/ussd", ussdController);

<<<<<<< HEAD
// DB connection
=======
// =======================
// MOCK FUNCTIONS
// =======================}

async function buyData(phone, plan) {
    return true;
}

// =======================
// MONGODB
// =======================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB connected"))
.catch(err => console.log("DB error:", err));

// Start server
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
