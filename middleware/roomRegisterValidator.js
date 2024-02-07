const roomRegisterValidator = (req, res, next) => {
  const { category, name, floor, description, seater, city, building } =
    req.body;
  if (
    !category ||
    !name ||
    !floor ||
    !description ||
    !seater ||
    !city ||
    !building
  ) {
    return res.status(400).json({
      err: "Few fields are missing, cannot process the request",
    });
  }

  next();
};

module.exports = {
  roomRegisterValidator,
};
