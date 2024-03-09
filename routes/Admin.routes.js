const express = require("express");

const { userRegistration } = require("../controllers/userController");
const { userRegisterValidator } = require("../middleware/userRegisterValidator.middleware");
const { roomRegisterValidator } = require("../middleware/roomRegisterValidator");
const { roomRegister, usersData, roomsData, editRoom, deleteRoom, editUser, deleteUser } = require("../controllers/adminController");

const adminRouter = express.Router();

adminRouter.post("/register", userRegisterValidator, userRegistration);

adminRouter.post("/room", roomRegisterValidator, roomRegister);

adminRouter.get("/userdata", usersData);

adminRouter.get("/roomsdata", roomsData);

//edit room
adminRouter.post("/editroom/:roomId", editRoom)

//delete room
adminRouter.get("/deleteroom/:roomId", deleteRoom)

//edit user
adminRouter.post("/edituser/:userId", editUser);

//delete user
adminRouter.get("/deleteuser/:userId", deleteUser);

module.exports = {
  adminRouter,
};
