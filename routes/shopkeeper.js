const app = require("express").Router();
const path = require("path");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const { Customer, Shopkeeper } = require("../model/users");
const { Request } = require("../model/requests");
const { orderConfirmation } = require("../utils/sendGrid");
const { Order } = require("../model/orders");
const { networkInterfaces } = require("os");

let Host = null;
const Port = process.env.PORT || "3000";

if (process.env.NODE_ENV === "production") {
  Host = "https://medi-hub.herokuapp.com";
} else {
  Host =
    process.env.HOST ||
    networkInterfaces().Ethernet.filter((e) => e.family === "IPv4")[0].address;
  Host = "http://" + Host + ":" + Port;
}

app.get("/", async (req, res) => {
  const shop = await Shopkeeper.findById(req.session.user._id);
  return res.render("sindex", { alerts: req.flash("alert"), shop });
});

app.get("/requests", async (req, res) => {
  const shop = await Shopkeeper.findById(req.session.user._id);
  // console.log(shop);
  // shop.requests.sort((a,b)=>  a.status - b.status);
  // console.log(shop);
  return res.render("srequest", {
    alerts: req.flash("alert"),
    requests: shop.requests,
  });
});

app.get("/requests/:requestId", async (req, res) => {
  const request = await Request.findById(req.params.requestId);
  const customer = await Customer.findById(request.customerId);
  return res.render("solveRequest", {
    alerts: req.flash("alert"),
    request,
    customer,
  });
});

app.post("/requests", async (req, res) => {
  const { request, availability, provideDate, comment, medicines } = req.body;
  const myrequest = await Request.findById(request);
  myrequest.availability = availability;
  myrequest.provideDate = provideDate;
  myrequest.shopkeeperComment = comment;

  myrequest.medicines = medicines ? medicines : [];
  myrequest.status = 1;
  await myrequest.save();
  const customer = await Customer.findById(myrequest.customerId);
  const shop = await Shopkeeper.findById(myrequest.shopkeeperId);
  customer.requests.id(myrequest._id).status = 1;
  shop.requests.id(myrequest._id).status = 1;
  await customer.save();
  await shop.save();
  const data = {
    Host,
    user: customer.firstName,
    shopName: shop.shopName,
    mobile: shop.mobile,
    myrequest,
  };
  // console.log(data);
  // return res.render("confirmation", data);

  ejs.renderFile(
    path.join(__dirname, "..", "views", "confirmation.ejs"),
    data,
    function (err, str) {
      if (err) {
        console.log(err);
      } else {
        orderConfirmation(customer.email, str)
          .then(() => {
            console.log("Confirmation Sent!");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  );
  req.flash("alert", {
    type: "success",
    msg: "This request is resolved successfully!",
  });
  return res.redirect("/s/requests");
});

app.get("/orders", async (req, res) => {
  const shop = await Shopkeeper.findById(req.session.user._id);
  return res.render("sorders", {
    alerts: req.flash("alert"),
    orders: shop.orders,
  });
});

app.get("/orders/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  const customer = await Customer.findById(order.customerId);
  return res.render("sorderDetails", {
    alerts: req.flash("alert"),
    order,
    customer,
  });
});

app.post("/order/delivered", async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  const customer = await Customer.findById(order.customerId);
  const shopkeeper = await Shopkeeper.findById(order.shopkeeperId);
  order.status = true;
  customer.orders.id(order._id).status = true;
  shopkeeper.orders.id(order._id).status = true;
  await order.save();
  await customer.save();
  await shopkeeper.save();
  req.flash("alert", {
    type: "success",
    msg: "Order status is updated successfully!",
  });
  return res.redirect("/s/orders");
});

app.get("/account", async (req, res) => {
  let user = null;
  if (req.session.user) {
    user = await Shopkeeper.findOne({ email: req.session.user.email });
  }
  return res.render("saccount", { alerts: req.flash("alert"), user });
});
app.post("/account", async (req, res) => {
  const {
    firstName,
    shopName,
    lastName,
    dob,
    address,
    email,
    mobile,
    pincode,
    state,
    district,
    pickup,
    delivery,
  } = req.body;
  let user = null;
  // console.log(pickup);
  // console.log(delivery);

  if (req.session.user) {
    user = await Shopkeeper.findOneAndUpdate(
      { email: req.session.user.email },
      {
        firstName,
        shopName,
        lastName,
        dob,
        address,
        email,
        mobile,
        pincode,
        state,
        district,
        pickup,
        delivery,
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
    return res.redirect("/s/account");
  });
});

module.exports = app;
