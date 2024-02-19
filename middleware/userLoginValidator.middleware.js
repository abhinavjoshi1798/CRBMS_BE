const userLoginValidator = (req, res, next) => {
  try {
    const { employeeId, pass } = req.body;

    // Check if required fields are missing
    if (!employeeId || !pass) {
      return res.status(400).json({
        error: "Missing fields, unable to process the request",
      });
    }

    // If all checks pass, move to the next middleware
    next();
  } catch (err) {
    // Handle any errors
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  userLoginValidator
};
