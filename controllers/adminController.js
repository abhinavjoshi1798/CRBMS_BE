const { RoomModel } = require("../model/Room.model");
const { UserModel } = require("../model/User.model");
const { dateConstructor, formatDate } = require("./dateController");

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

    const timestamp = dateConstructor();
    const formattedDate = formatDate(timestamp);

    const room = new RoomModel({
      category,
      name,
      floor,
      description,
      seater,
      city,
      building,
      dateCreated: formattedDate,
      isDeleted: false,
      new: false,
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

const editRoom = async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await RoomModel.findById(roomId);
    if (!room) {
      return res.status(404).send({ error: "Room not found" });
    }

    const { category, name, floor, description, seater, city, building } =
      req.body;

    const timestamp = dateConstructor();
    const formattedDate = formatDate(timestamp);

    const newRoom = {
      category,
      name,
      floor,
      description,
      seater,
      city,
      building,
      new: true,
      dateCreated: formattedDate,
      isDeleted: false,
    };

    // Validate required fields
    if (
      !newRoom.name ||
      !newRoom.category ||
      !newRoom.floor ||
      !newRoom.description ||
      !newRoom.seater ||
      !newRoom.city ||
      !newRoom.building
    ) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const updatedRoom = await RoomModel.findOneAndUpdate(
      { _id: roomId },
      newRoom,
      { new: true }
    );

    res.status(200).send({
      msg: `room details with _id: ${updatedRoom._id} has been updated`,
      updatedRoom,
    });
  } catch (err) {
    console.log("error from editRoom: ", err);
    res.status(500).send({ error: "Internal server error" });
  }
};

const deleteRoom = async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await RoomModel.findById(roomId);
    if (!room) {
      res.status(400).send({ msg: "room is not available in DB" });
    }
    if (room.isDeleted) {
      res.status(200).send({ msg: "room is already deleted" });
    }

    const timestamp = dateConstructor();
    const formattedDate = formatDate(timestamp);

    const deletedRoom = await RoomModel.findByIdAndUpdate(
      { _id: roomId },
      {
        isDeleted: true,
        dateCreated: formattedDate,
      },
      { new: true }
    );

    res.status(200).send({
      msg: `room has been deleted`,
      deletedRoom,
    });
  } catch (err) {
    console.log("error from deleteRoom: ", err);
    res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  roomRegister,
  usersData,
  roomsData,
  editRoom,
  deleteRoom,
};
