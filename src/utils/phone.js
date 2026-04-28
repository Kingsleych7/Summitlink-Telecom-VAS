const normalizePhone = (phone) => {
  if (!phone) return null;

  // remove spaces, +, and leading 0
  phone = phone.replace(/\s/g, "");

  if (phone.startsWith("+")) {
    phone = phone.substring(1);
  }

  if (phone.startsWith("0")) {
    phone = "234" + phone.substring(1); // Nigeria format
  }

  return phone;
};

module.exports = { normalizePhone };
