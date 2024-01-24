// routes are controller only . MVC Model
const express = require("express");
const { UserModel } = require("../model/User.model");
const { RoomModel } = require("../model/Room.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const adminRouter = express.Router();

adminRouter.post("/register", async (req, res) => {
  const { name, email, pass, role, employeeId, city, building } = req.body;
  try {
    bcrypt.hash(pass, 5, async (err, hash) => {
      const user = new UserModel({
        name,
        email,
        pass: hash,
        role,
        employeeId,
        city,
        building,
      });
      await user.save();
      res.status(200).send({ msg: "New user has been registered" });
    });
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

adminRouter.post("/room", async (req, res) => {
  const { category, name, floor, description, seater, city, building } =
    req.body;
  try {
    const room = new RoomModel({
      category,
      name,
      floor,
      description,
      seater,
      city,
      building,
    });
    await room.save();
    res.status(200).send({ msg: "New room has been registered" });
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

adminRouter.get("/userdata", async (req, res) => {
  try {
    const userObj = await UserModel.findOne({ _id: req.body.loggedInUserId });
    const userdata = await UserModel.find({ role: "employee" });
    res.status(200).send({
      "UsersData": userdata,
      "user": userObj
    });
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

adminRouter.get("/roomsdata", async (req, res) => {
  try {
    const roomdata = await RoomModel.find({});
    res.status(200).send(roomdata);
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

module.exports = {
  adminRouter,
};
