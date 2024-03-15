const express = require("express");

const { userRegistration } = require("../controllers/userController");
const { userRegisterValidator } = require("../middleware/userRegisterValidator.middleware");
const { roomRegisterValidator } = require("../middleware/roomRegisterValidator");
const { roomRegister, usersData, roomsData, editRoom, deleteRoom, editUser, deleteUser, singleRoomData, singleUserData, importUser } = require("../controllers/adminController");

const adminRouter = express.Router();

// --------------------------------------- CSV File Upload
const multer = require('multer');
const path = require("path");
const bodyParser = require("body-parser");

adminRouter.use(bodyParser.urlencoded({extended:true}));
adminRouter.use(express.static(path.resolve(__dirname,'public')));

let storage =  multer.diskStorage({
  destination:(req,file,cb) => {
 cb(null,'./public/uploads')
  },
  filename:(req,file,cb) => {
  cb(null,file.originalname)
  }
})

let upload = multer({storage:storage})

// ---------------------------------------



adminRouter.post("/register", userRegisterValidator, userRegistration);

adminRouter.post("/room", roomRegisterValidator, roomRegister);

adminRouter.get("/userdata", usersData);

adminRouter.get("/roomsdata", roomsData);

//single room dat
adminRouter.get("/room/:roomId", singleRoomData);

//edit room
adminRouter.post("/editroom/:roomId", editRoom)

//delete room
adminRouter.get("/deleteroom/:roomId", deleteRoom)

//single user data
adminRouter.get("/users/:userId", singleUserData),

//edit user
adminRouter.post("/edituser/:userId", editUser);

//delete user
adminRouter.get("/deleteuser/:userId", deleteUser);

//edit user password
adminRouter.post("/editpassword/:userId",editUserPassword)

adminRouter.post("/importuser",upload.single('file'),importUser)


module.exports = {
  adminRouter,
};
