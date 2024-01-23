const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.connect(
  // "mongodb+srv://abhinavjoshi1798:candyman@cluster0.ztbnruv.mongodb.net/?retryWrites=true&w=majority"
  "mongodb://localhost:27017/crbms"
);

module.exports = {
  connection,
};
