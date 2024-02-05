const express = require("express");
const { connection } = require("./db");
const { userRouter } = require("./routes/User.routes");
const { adminRouter } = require("./routes/Admin.routes");
const { auth } = require("./middleweare/auth.middleware");
const cors = require("cors");
const { adminValidator } = require("./middleweare/adminValidator.middleware");
const { employeeValidator } = require("./middleweare/employeeValidator.middleware");
const { employeeRouter } = require("./routes/Employee.routes");
const { bookingRouter } = require("./routes/Bookings.routes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRouter);

//Protected Routes
app.use(auth);
app.use("/admin", adminValidator, adminRouter);
app.use("/employee", employeeValidator, employeeRouter);
app.use("/bookings", employeeValidator, bookingRouter);

app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log("connected to DB");
  } catch (err) {
    console.log(err);
    console.log("Cannot connect to the DB");
  }
  console.log(`server is running at ${process.env.port}`);
});
