const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.connect("mongodb+srv://abhinavjoshi1798:candyman@cluster0.ztbnruv.mongodb.net/CRBMS?retryWrites=true&w=majority");

module.exports = {
  connection,
};

