const crypto = require("crypto");

function getRequestId(phone, text) {
    return crypto
        .createHash("md5")
        .update(phone + text)
        .digest("hex");
}

module.exports = { getRequestId };
