const roomRegisterValidator = (req, res, next) => {
  try {
    const { category, name, floor, description, seater, city, building } = req.body;
    
    // Check if required fields are missing
    if (!category || !name || !floor || !description || !seater || !city || !building) {
      return res.status(400).json({
        error: "Missing fields, unable to process the request",
      });
    }

    // If all checks pass, move to the next middleware
    next();
  } catch (err) {
    // Log the error for debugging
    console.error("Error in roomRegisterValidator:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  roomRegisterValidator,
};
