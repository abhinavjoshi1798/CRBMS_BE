const express = require("express");

const { userRegistration } = require("../controllers/userController");
const {
  userRegisterValidator,
} = require("../middleware/userRegisterValidator.middleware");
const {
  roomRegisterValidator,
} = require("../middleware/roomRegisterValidator");
const {
  roomRegister,
  usersData,
  roomsData,
} = require("../controllers/adminController");

const adminRouter = express.Router();

adminRouter.post("/register", userRegisterValidator, userRegistration);

adminRouter.post("/room", roomRegisterValidator, roomRegister);

adminRouter.get("/userdata", usersData);

adminRouter.get("/roomsdata", roomsData);

module.exports = {
  adminRouter,
};
