const express = require("express");
const {
  userRegisterValidator,
} = require("../middleware/userRegisterValidator.middleware");
const {
  userRegistration,
  userLogin,
} = require("../controllers/userController");
const {
  userLoginValidator,
} = require("../middleware/userLoginValidator.middleware");

const userRouter = express.Router();

// Base Route to make first user (admin and employee)
userRouter.post("/register", userRegisterValidator, userRegistration);

// This route is used by all the users (admin / employee) to login
userRouter.post("/login", userLoginValidator, userLogin);

module.exports = {
  userRouter,
};
