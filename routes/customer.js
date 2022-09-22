const app = require("express").Router();
const moment = require("moment");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Customer, Shopkeeper } = require("../model/users");
const { Request } = require("../model/requests");
const { Order } = require("../model/orders");

app.get("/", async (req, res) => {
  console.log(req.session.user);
  const shops = await Shopkeeper.find(
    { pincode: req.session.user.pincode },
    "_id shopName address district state mobile pincode pickup delivery"
  );
  // console.log(shops);
  return res.render("cindex", { alerts: req.flash("alert"), shops });
});

app.post("/", async (req, res) => {
  const shops = await Shopkeeper.find(
    { pincode: req.body.search },
    "_id shopName address district state mobile pincode pickup delivery"
  );
  // console.log(shops);
  return res.render("cindex", { alerts: req.flash("alert"), shops });
});

app.get("/requests", async (req, res) => {
  const customer = await Customer.findById(req.session.user._id);
  return res.render("crequest", {
    alerts: req.flash("alert"),
    requests: customer.requests,
  });
});

app.post("/requestDetails", async (req, res) => {
  const requestId = req.body.request;
  const request = await Request.findById(requestId);
  const customer = await Customer.findById(request.customerId);
  const shop = await Shopkeeper.findById(request.shopkeeperId);

  let total = 0;
  request.medicines.forEach((medicine) => {
    total += medicine.price;
  });
  return res.render("requestDetails", {
    alerts: req.flash("alert"),
    request,
    shop,
    total,
  });
});

app.get("/orders", async (req, res) => {
  const customer = await Customer.findById(req.session.user._id);
  return res.render("corders", {
    alerts: req.flash("alert"),
    orders: customer.orders,
  });
});

app.get("/orders/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  const shop = await Shopkeeper.findById(
    order.shopkeeperId,
    "-orders -requests"
  );
  console.log(shop);
  return res.render("corderDetails", {
    alerts: req.flash("alert"),
    order,
    shop,
  });
});

app.get("/order-confirmation/:requestId", async (req, res) => {
  const { requestId } = req.params;
  let request = null;
  if (mongoose.isValidObjectId(requestId)) {
    const already = await Order.findOne({ requestId });
    if (already) {
      return res.send(`
            <div style="text-align:center;">
                <h2 style="color: green;">Your order is already confirmed.</h2>
            </div>
            `);
    }
    request = await Request.findById(requestId);
    if (request) {
      const customer = await Customer.findById(request.customerId);
      const shopkeeper = await Shopkeeper.findById(request.shopkeeperId);
      const today = moment().format("DD/MM/YYYY");
      const order = new Order({
        customerId: request.customerId,
        shopkeeperId: request.shopkeeperId,
        requestId,
        date: today,
        provideDate: request.provideDate,
        medicines: request.medicines,
        type: request.type,
      });
      customer.orders.push({
        _id: order._id,
        shopName: shopkeeper.shopName,
        date: today,
        mobile: customer.mobile,
        type: request.type,
      });
      shopkeeper.orders.push({
        _id: order._id,
        customerName:
          customer.firstName +
          " " +
          customer.middleName +
          " " +
          customer.lastName,
        date: today,
        mobile: customer.mobile,
        type: request.type,
      });
      await order.save();
      await customer.save();
      await shopkeeper.save();
      return res.send(`
            <div style="text-align:center;">
                <h2 style="color: green;">Your order has been confirmed.</h2>
            </div>
            `);
    }
  }
  return res.send(`
            <div style="text-align:center;">
                <h2 style="color: red;">Invalid Request</h2>
            </div>
    `);
});

app.get("/enquiry/:id", async (req, res) => {
  const shop = await Shopkeeper.findById(req.params.id);
  return res.render("enquiry", { alerts: req.flash("alert"), shop });
});

app.get("/account", async (req, res) => {
  let user = null;
  if (req.session.user) {
    user = await Customer.findOne({ email: req.session.user.email });
  }
  return res.render("caccount", { alerts: req.flash("alert"), user });
});
app.post("/account", async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    dob,
    address,
    email,
    mobile,
    pincode,
    state,
    district,
  } = req.body;
  let user = null;
  console.log(mobile);
  if (req.session.user) {
    user = await Customer.findOneAndUpdate(
      { email: req.session.user.email },
      {
        firstName,
        middleName,
        lastName,
        dob,
        address,
        email,
        mobile,
        pincode,
        state,
        district,
      },
      { new: true }
    );
    req.flash("alert", {
      type: "success",
      msg: "Your Account has been updated!",
    });
  }
  req.session.user = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    pincode: user.pincode,
    userType: user.userType,
  };
  req.session.save(function (err) {
    return res.redirect("/c/account");
  });
});

app.post("/enquiry", async (req, res) => {
  const { shop, date, comment, type } = req.body;
  const prescription = req.file;
  const customerId = req.session.user._id;

  const today = moment().format("DD/MM/YYYY");
  // console.log(today);
  const request = await Request.create({
    type,
    shopkeeperId: shop,
    customerId,
    date: today,
    prescriptionImage: prescription.path,
    wantDate: date,
    userComment: comment,
    status: 0,
  });

  const myShop = await Shopkeeper.findById(shop);
  const customer = await Customer.findById(customerId);

  customer.requests.push({
    _id: request._id,
    shopName: myShop.shopName,
    date: today,
    prescriptionImage: request.prescriptionImage,
    wantDate: request.wantDate,
    type: request.type,
    status: 0,
  });

  myShop.requests.push({
    _id: request._id,
    customerName: customer.firstName + " " + customer.lastName,
    date: request.date,
    prescriptionImage: request.prescriptionImage,
    wantDate: request.wantDate,
    mobile: customer.mobile,
    type: request.type,
    status: 0,
  });

  await customer.save();
  await myShop.save();
  // console.log(request);
  req.flash("alert", {
    type: "success",
    msg: "Your Request has been submitted!",
  });
  return res.redirect("/c/requests");
});

module.exports = app;
