const validator = require("email-validator");

const userRegisterValidator = (req, res, next) => {
  try {
    const { name, email, pass, role, employeeId, city, building } = req.body;

    // Check if required fields are missing
    if (!name || !email || !pass || !role || !employeeId || !city || !building) {
      return res.status(400).json({
        error: "Missing fields, unable to process the request",
      });
    }

    // Validate email format
    if (!validator.validate(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // If all checks pass, move to the next middleware
    next();
  } catch (err) {
    // Log the error for debugging
    console.error("Error in userRegisterValidator:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  userRegisterValidator,
};
