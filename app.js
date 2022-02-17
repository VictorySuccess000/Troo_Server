const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const app = express();
const { promisify } = require("util");

// Connect Database
connectDB();
// Init Middleware
app.use(express.json());

app.use(logger("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "angelkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);
app.use(fileUpload());
// const workpath=__dirname + '/public';
// app.use('/public', express.static(workpath));

app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/checktoken", require("./routes/api/checktoken"));
app.use("/api/checkusers", require("./routes/api/checkusers"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/reset", require("./routes/api/reset"));
app.use("/api/otp", require("./routes/api/otp"));
app.use("/api/blog", require("./routes/api/blog"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/hashtag", require("./routes/api/hashtag"));
app.use("/api/create-payment-intent", require("./routes/api/stripepayment"));

// Serve frontend built
app.use(express.static("public"));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
})

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   // res.locals.message = err.message;
//   // res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // // render the error page
//   // res.status(err.status || 500);
//   // res.render('error');
// });

const PORT = 4000;
app.listen(PORT, async () => {
  console.log("basic dir", __dirname);
  console.log(`Server started on port ${PORT}`);
});
