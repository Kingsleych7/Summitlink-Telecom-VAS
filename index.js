require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

// ✅ INIT APP FIRST
const app = express();

// ✅ IMPORT CONTROLLER
const ussdController = require("./src/ussd/ussdController");

// ✅ MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ RATE LIMIT
const ussdLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30
});

// ✅ APPLY LIMITER + ROUTE (ONLY ONCE)
app.post("/ussd", ussdLimiter, ussdController);

// ✅ DB CONNECT
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB connected"))
.catch(err => console.log("DB error:", err));

// ✅ START SERVER
app.listen(process.env.PORT || 10000, () => {
    console.log("Server running");
});
