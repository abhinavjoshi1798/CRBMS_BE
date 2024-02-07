const userLoginValidator = (req, res, next) => {
  const { employeeId, pass } = req.body;

  if (!employeeId || !pass) {
    return res.status(400).json({
      err: "Few fields are missing, cannot process the request",
    });
  }
  next();
};

module.exports = {
  userLoginValidator
};
