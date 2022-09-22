const express = require("express");
const app = express();
const { Order } = require("./model/orders");
const { Request } = require("./model/requests");
const { Customer, Shopkeeper } = require("./model/users");
const multer = require("multer");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
require("express-async-errors");
const config = require("config");
const login = require("./routes/login");
const register = require("./routes/register");
const customer = require("./routes/customer");
const shopKeeper = require("./routes/shopkeeper");
const changePass = require("./routes/changePass");
const error = require("./utils/error");
const { networkInterfaces } = require("os");

const mongoDBUri = config.get("mongodb_uri");

const store = new MongoDBStore({
  uri: mongoDBUri,
  collection: "inputSessions",
});

mongoose
  .connect(mongoDBUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connection established!");
  })
  .catch((err) => console.log(err));

let sess = {
  secret: config.get("sessionKey"),
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {},
};

//multer settings
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images"),
  filename: (req, file, cb) => {
    var fileName = file.originalname;
    cb(null, fileName);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const useCache = {
  maxAge: "23h",
};
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
  useCache.maxAge = "24h";
}

//middlewares
app.use(express.static("./public", useCache));
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.json());
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("prescription")
);
app.use("/images", express.static("images"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session(sess));
app.use(flash());
app.use((req, res, next) => {
  // console.log(req.body);
  const user = req.session.user;
  res.locals.currentUser = {
    username: "",
    email: "",
  };
  if (user) {
    // console.log(user);
    let username = "";
    if (user.firstName) {
      username += user.firstName;
    }
    if (user.lastName) {
      username += " " + user.lastName;
    }
    res.locals.currentUser.username = username != "" ? username : "Unnamed";
    res.locals.currentUser.email = user.email;
  }
  next();
});

app.get("/", async (req, res) => {
  const members = await Customer.find().countDocuments();
  const orders = await Order.find().countDocuments();
  const requests = await Request.find().countDocuments();
  return res.render("main", { members, orders, requests });
});
app.get("/about", async (req, res) => {
  return res.render("about");
});

const alreadyLogged = (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.userType == "Customer") {
      return res.redirect("/c");
    } else if (req.session.user.userType == "Shopkeeper") {
      return res.redirect("/s");
    } else {
      req.flash("alert", {
        type: "danger",
        msg: "Something went wrong. Try again!",
      });
      req.session.destroy((err) => {
        if (err) console.log(err);
        return res.redirect("/login");
      });
    }
  } else {
    next();
  }
};

app.use("/login", alreadyLogged, login);
app.use("/register", alreadyLogged, register);

app.use("/c", customer);
app.use("/s", shopKeeper);
app.use("/change-password", changePass);
app.use("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    return res.redirect("/login");
  });
});

app.use(error);

app.use((req, res) => {
  return res.send("<h1>404 Not Found!</h1>");
});

const Port = process.env.PORT || 3000;

if (process.env.NODE_ENV == "development") {
  const Host =
    process.env.HOST ||
    networkInterfaces().Ethernet.filter((e) => e.family === "IPv4")[0].address;

  app.listen(Port, Host, () =>
    console.log(`Listening on ${"http://" + Host + ":" + Port}`)
  );
} else {
  app.listen(Port, () => console.log(`Listening on post....${Port}`));
}
