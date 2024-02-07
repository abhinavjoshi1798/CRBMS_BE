const validator = require("email-validator");

const userRegisterValidator = (req, res, next) => {
  const { name, email, pass, role, employeeId, city, building } = req.body;

  if (!name || !email || !pass || !role || !employeeId || !city || !building) {
    return res.status(400).json({
      err: "Few fields are missing, cannot process the request",
    });
  } else if (!validator.validate(email)) {
    return res.status(400).json({
      err: "Email is invalid",
    });
  }
  next();
};


module.exports = {
  userRegisterValidator,
};
