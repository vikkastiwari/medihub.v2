const sgMail = require("@sendgrid/mail");
const config = require("config");

sgMail.setApiKey(config.get("sendGridAPIKey"));

const fromMail = "welcome@MEDIHUB";

async function sendOTP(toMail, otp) {
  const msg = {
    to: toMail,
    from: fromMail,
    subject: "OTP Verification",
    html:
      "<p>Welcome to MEDIHUB, Your One Time Password (OTP) is <strong>" +
      otp +
      "</strong> for Log In and it will expire in 5 minutes.</p>",
  };
  return sgMail.send(msg);
}

async function resetPassword(toMail, token) {
  const msg = {
    to: toMail,
    from: fromMail,
    subject: "Reset Password",
    html: `<p>Welcome to MEDIHUB</p><br/>
          <p>To reset you password and create a new one <a href='http://localhost:3000/newpassword?token=${token}'>Click Here<a/></p>
          `,
  };
  return sgMail.send(msg);
}

async function orderConfirmation(toMail, html) {
  const msg = {
    to: toMail,
    from: fromMail,
    subject: "Order Confirmation",
    html: html,
  };
  return sgMail.send(msg);
}

module.exports = {
  sendOTP,
  orderConfirmation,
  resetPassword,
};
