const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
  service: "smtppro.zoho.com",
  port: 587,
  auth: {
    user: process.env.ADMIN_EMAIL || "info@mylookbook.in",
    pass: process.env.ADMIN_PASS || "Lookbook@123",
  },
  tls: {
    rejectUnauthorized: false, // Add this line to disable certificate verification
  },
})