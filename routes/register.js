const express = require("express");
const app = express.Router();
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const config = require("config");
const { sendOTP } = require("../utils/sendGrid");
const { Customer, Shopkeeper } = require("../model/users");

app.get("/", (req, res) => {
  return res.render("register.ejs", { alerts: req.flash("alert") });
});

app.get("/otp", (req, res) => {
  return res.render("otp", { alerts: req.flash("alert") });
});

app.post("/", async (req, res) => {
  // console.log(req.body.name);
  const email = req.body.email;
  const password = req.body.password;
  const confirm = req.body.confirm;
  const userType = req.body.user;

  if (password != confirm) {
    req.flash("alert", {
      type: "danger",
      msg: "Confirm password must be same as password.",
    });
    return res.redirect("/login");
  }

  let user;
  if (userType == "Customer") {
    user = await Customer.findOne({ email });
  } else if (userType == "Shopkeeper") {
    user = await Shopkeeper.findOne({ email });
  } else {
    // return res.send('User type not found.');
    req.flash("alert", {
      type: "danger",
      msg: "User type not found.",
    });
    return res.redirect("/register");
  }

  if (user && user.verified) {
    // return res.send('User already exists.');
    req.flash("alert", {
      type: "warning",
      msg: "User already exists.",
    });
    return res.redirect("/register");
  }

  const newOTP = otpGenerator.generate(6, {
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  if (userType == "Customer") {
    if (user) {
      await Customer.findByIdAndDelete(user._id);
    }
    user = await Customer.create({
      email,
      password: bcrypt.hashSync(password, 12),
      userType,
      otp: newOTP,
    });
  } else if (userType == "Shopkeeper") {
    if (user) {
      await Shopkeeper.findByIdAndDelete(user._id);
    }
    user = await Shopkeeper.create({
      email,
      password: bcrypt.hashSync(password, 12),
      userType,
      otp: newOTP,
    });
  }
  console.log("OTP : " + newOTP);
  req.session.user = {
    email: user.email,
    password: user.password,
    userType: user.userType,
  };
  if (config.get("otpChahiye")) {
    await sendOTP(user.email, user.otp);
  }
  req.flash("alert", {
    type: "primary",
    msg: "OTP has been sent to your email.",
  });
  req.session.save(function (err) {
    return res.redirect("/register/otp");
  });
});

app.post("/otp", async (req, res) => {
  // console.log('I\'m in.');
  console.log(req.session.user);
  if (!req.session.user) return res.redirect("/login");
  const email = req.session.user.email;
  const userType = req.session.user.userType;
  const otp = req.body.otp;

  if (userType == "Customer") {
    user = await Customer.findOne({ email });
  } else if (userType == "Shopkeeper") {
    user = await Shopkeeper.findOne({ email });
  }

  if (user.otp == otp) {
    user.verified = true;
    await user.save();
    if (userType == "Customer") {
      return res.redirect("/c/account");
    } else if (userType == "Shopkeeper") {
      return res.redirect("/s/account");
    }
  } else {
    req.flash("alert", {
      type: "danger",
      msg: "You have entered wrong OTP!",
    });
    return res.redirect("/register/otp");
  }
});

app.post("/resendOtp", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  const email = req.session.user.email;
  const userType = req.session.user.userType;

  if (userType == "Customer") {
    user = await Customer.findOne({ email });
  } else if (userType == "Shopkeeper") {
    user = await Shopkeeper.findOne({ email });
  }

  const newOTP = otpGenerator.generate(6, {
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });
  user.otp = newOTP;
  await user.save();
  console.log("OTP : " + newOTP);
  if (config.get("otpChahiye")) {
    await sendOTP(user.email, user.otp);
  }
  req.flash("alert", {
    type: "success",
    msg: "OTP has been resent successfully!",
  });

  return res.redirect("/register/otp");
});

module.exports = app;
