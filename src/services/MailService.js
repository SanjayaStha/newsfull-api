require("dotenv").config();
const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const registrationMail = (toMail, code) => {
  let message = {
    from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_EMAIL}>`,
    to: toMail,
    subject: "Email Confirmation",
    text: "For clients with plaintext support only",
    html: `<h1>Registration Mail</h1><p>Your verification code: ${code}</p>`,
  };

  let info = transporter.sendMail(message);
  return info;
};

const resetPassword = (toMail, code) => {
  let message = {
    from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_EMAIL}>`,
    to: toMail,
    subject: "Password Reset",
    text: "For clients with plaintext support only",
    html: `<h1>Registration Mail</h1><a href='http://localhost:${process.env.PORT}/password/reset/${code}'>Reset Password</a>`,
  };

  let info = transporter.sendMail(message);
  return info;
};

const registerFromAdmin = (toMail, code) => {
  let message = {
    from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_EMAIL}>`,
    to: toMail,
    subject: "Email Confirmation",
    text: "For clients with plaintext support only",
    html: `<h1>Registration Mail</h1><p>Your verification code: ${code}</p><h3>Your credential detail:</h3><p>Email: ${toMail}</p><p>Password: secret</p>`,
  };

  let info = transporter.sendMail(message);
  return info;
};

module.exports = { registrationMail, resetPassword, registerFromAdmin };
