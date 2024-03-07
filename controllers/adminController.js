const { RoomModel } = require("../model/Room.model");
const { UserModel } = require("../model/User.model");

const roomRegister = async (req, res) => {
  const { category, name, floor, description, seater, city, building } =
    req.body;
  try {
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
        error: "Missing fields, unable to process the request",
      });
    }

    const room = new RoomModel({
      category,
      name,
      floor,
      description,
      seater,
      city,
      building,
    });
    await room.save();
    res.status(200).send({ msg: "New room has been registered" });
  } catch (err) {
    console.error("Error in roomRegister:", err);
    res.status(500).send({ error: "Internal server error" });
  }
};

const usersData = async (req, res) => {
  try {
    const loggedInUserId = req.body.loggedInUserId; // Assuming loggedInUserId is sent in the request body
    if (!loggedInUserId) {
      return res.status(400).send({ error: "loggedInUserId is required" });
    }

    const userObj = await UserModel.findOne({ _id: loggedInUserId });
    if (!userObj) {
      return res.status(404).send({ error: "User not found" });
    }

    const userData = await UserModel.find();

    res.status(200).send({
      UsersData: userData,
      user: userObj,
    });
  } catch (err) {
    console.error("Error in usersData:", err);
    res.status(500).send({ error: "Internal server error" });
  }
};

const roomsData = async (req, res) => {
  try {
    const roomData = await RoomModel.find({});
    res.status(200).send({ rooms: roomData });
  } catch (err) {
    console.error("Error in roomsData:", err);
    res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  roomRegister,
  usersData,
  roomsData,
};
