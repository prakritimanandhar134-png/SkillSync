const { Resend } = require("resend");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

module.exports = { resend };
