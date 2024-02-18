const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.INFO_EMAIL || "info@gstkanotice.com",
    pass: process.env.EMAIL_APP_PASS || "UPDATE ENV APP CODE",
  },
  tls: {
    rejectUnauthorized: false
  }
 });