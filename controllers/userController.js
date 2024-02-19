const bcrypt = require("bcrypt");
const { UserModel } = require("../model/User.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userRegistration = async (req, res) => {
  try {
    const { name, email, pass, role, employeeId, city, building } = req.body;

    // Hash the password using bcrypt
    const hash = await bcrypt.hash(pass, 5);

    // Create a new user instance
    const user = new UserModel({
      name,
      email,
      pass: hash,
      role,
      employeeId,
      city,
      building,
    });

    // Save the user to the database
    await user.save();

    // Respond with success message
    res.status(200).send({ msg: "New user has been registered" });
  } catch (err) {
    // Handle errors
    res.status(400).send({ error: err.message });
  }
};

const userLogin = async (req, res) => {
  try {
    const { employeeId, pass } = req.body;

    // Find user by employeeId
    const user = await UserModel.findOne({ employeeId });

    if (user) {
      // Compare passwords
      const passwordMatch = await bcrypt.compare(pass, user.pass);

      if (passwordMatch) {
        // Generate JWT token
        const token = jwt.sign(
          {
            userId: user._id,
            role: user.role,
          },
          process.env.secretKey
        );

        // Respond with success message and token
        res
          .status(200)
          .send({ msg: "Login Successful", token, role: user.role });
      } else {
        // Respond with incorrect credentials message
        res.status(401).send({ error: "Wrong Credentials!!!" });
      }
    } else {
      // Respond with incorrect credentials message
      res.status(401).send({ error: "Wrong Credentials!!!" });
    }
  } catch (err) {
    // Handle errors
    res.status(500).send({ error: err.message });
  }
};

module.exports = {
  userRegistration,
  userLogin,
};
