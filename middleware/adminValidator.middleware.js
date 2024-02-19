const jwt = require("jsonwebtoken");
require("dotenv").config();

const adminValidator = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ msg: "Please Login!!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.secretKey);
    if (!decoded) {
      return res.status(401).send({ msg: "Please Login!!!" });
    }

    console.log(decoded);
    if (decoded.role !== "admin") {
      return res
        .status(403)
        .send({ msg: "Only Admins are allowed on this page" });
    }

    next();
  } catch (err) {
    console.error("Error in adminValidator:", err);
    res.status(500).send({ err: err.message });
  }
};

module.exports = {
  adminValidator,
};
