// routes are controller only . MVC Model
const express = require("express");
const { UserModel } = require("../model/User.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const {  name, email, pass, role, employeeId, city, building } = req.body;
  try {
    bcrypt.hash(pass, 5, async (err, hash) => {
      const user = new UserModel({  name, email, pass:hash, role, employeeId, city, building });
      await user.save();
      res.status(200).send({ msg: "New user has been registered" });
    });
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

userRouter.post("/login", async (req, res) => {
  const { employeeId, pass } = req.body;
  try {
    const user = await UserModel.findOne({ employeeId });
    if (user) {
      bcrypt.compare(pass, user.pass, (err, result) => {
        if (result) {
          const token = jwt.sign({
            userRole: user._id,
            
          }, process.env.secretKey);
          // backend is a random payload . used to encode the token
          // masai is the secret key which is used to decode the token
          res.status(200).send({ msg: "Login Successful", token: token, "role":user.role });
        } else {
          res.status(200).send({ msg: "Wrong Credentials!!!" });
        }
      });
    } else {
      res.status(200).send({ msg: "Wrong Credentials!!!" });
    }
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

module.exports = {
  userRouter,
};
