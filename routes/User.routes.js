const express = require("express");
const { UserModel } = require("../model/User.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const userRouter = express.Router();

// Base Route to make first user (admin and employee)
userRouter.post("/register", async (req, res) => {
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

// This route is used by all the users (admin / employee) to login
userRouter.post("/login", async (req, res) => {
  const { employeeId, pass } = req.body;
  try {
    const user = await UserModel.findOne({ employeeId });
    if (user) {
      bcrypt.compare(pass, user.pass, (err, result) => {
        if (result) {
          const token = jwt.sign(
            {
              userId: user._id,
              role: user.role
            },
            process.env.secretKey
          );
          // backend is a random payload . used to encode the token
          // masai is the secret key which is used to decode the token
          res.status(200).send({ msg: "Login Successful", token: token, role: user.role });
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
