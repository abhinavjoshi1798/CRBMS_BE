const { RoomModel } = require("../model/Room.model");
const { UserModel } = require("../model/User.model");
const { dateConstructor, formatDate } = require("./dateController");
const bcrypt = require("bcrypt");
var csv = require("csvtojson");

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

const editUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const { name, email, pass, role, employeeId, city, building } = req.body;

    if (
      !name ||
      !email ||
      !pass ||
      !role ||
      !employeeId ||
      !city ||
      !building
    ) {
      return res.status(400).send({ msg: "Required fields are missing" });
    }

    // Hash the password using bcrypt
    const hash = await bcrypt.hash(pass, 5);

    const timestamp = dateConstructor();
    const formattedDate = formatDate(timestamp);

    // Create a new user instance
    const newUser = await UserModel.findByIdAndUpdate(
      { _id: userId },
      {
        name,
        email,
        pass: hash,
        role,
        employeeId,
        city,
        building,
        new: true,
        dateCreated: formattedDate,
        isDeleted: false,
      },
      { new: true }
    );

    // Respond with success message
    res.status(200).send({ msg: "User details has been Updated", newUser });
  } catch (err) {
    console.log("error from editUser: ", err);
    res.status(500).send({ error: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) {
      return res.status(400).send({ err: "userId is not available in params" });
    }
    const deletedUser = await UserModel.findByIdAndUpdate(
      { _id: userId },
      {
        isDeleted: true,
      },
      {
        new: true,
      }
    );

    if (!deletedUser) {
      return res
        .status(400)
        .send({ msg: "user with the given userId is not available in DB" });
    }

    res
      .status(200)
      .send({ msg: `user with id ${userId} is deleted`, deletedUser });
  } catch (err) {
    console.log("error from deleteUser: ", err);
    res.status(500).send({ error: "Internal server error" });
  }
};

const singleRoomData = async (req, res) => {
  const { roomId } = req.params;
  try {
    if (!roomId) {
      return res.status(400).send({ msg: "roomId must be present in params" });
    }
    const roomData = await RoomModel.findById(roomId);
    if (!roomData) {
      return res
        .status(400)
        .send({ msg: "Room for the given room Id is not available in DB" });
    }
    res.status(200).send({ roomData });
  } catch (err) {
    console.log("error from singleRoomData: ", err);
    res.status(500).send({ error: "Internal server error" });
  }
};

const singleUserData = async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) {
      return res.status(400).send({ msg: "userId must be present in params" });
    }
    const userData = await UserModel.findById(userId);
    if (!userData) {
      return res
        .status(400)
        .send({ msg: "User for the given userId is not available in DB" });
    }
    res.status(200).send({ userData });
  } catch (err) {
    console.log("error from singleUserData: ", err);
    res.status(500).send({ error: "Internal server error" });
  }
};

const importUser = async (req, res) => {
  try {
    var userData = [];

    const timestamp = dateConstructor();
    const formattedDate = formatDate(timestamp);

    csv()
      .fromFile(req.file.path)
      .then(async (response) => {
        for (var x = 0; x < response.length; x++) {
          userData.push({
            name: response[x].Name,
            email: response[x].Email,
            pass: response[x].Password,
            role: response[x].Role,
            employeeId: response[x].EmployeeId,
            city:response[x].City,
            building:response[x].Building,
            new:false,
            isDeleted:false,
            dateCreated:formattedDate
          });
        }
        await UserModel.insertMany(userData);
      });

    res.send({ status: 200, msg: "users from csv imported" });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

module.exports = {
  roomRegister,
  usersData,
  roomsData,
  editRoom,
  deleteRoom,
  editUser,
  deleteUser,
  singleRoomData,
  singleUserData,
  importUser,
};
