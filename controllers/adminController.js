const { RoomModel } = require("../model/Room.model");
const { UserModel } = require("../model/User.model");

const roomRegister = async (req, res) => {
  const { category, name, floor, description, seater, city, building } =
    req.body;
  try {
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
    res.status(400).send({ err: err.message });
  }
};

const usersData = async (req, res) => {
  try {
    const userObj = await UserModel.findOne({ _id: req.body.loggedInUserId });
    const userdata = await UserModel.find({ role: "employee" });
    res.status(200).send({
      UsersData: userdata,
      user: userObj,
    });
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
};

const roomsData = async (req, res) => {
  try {
    const roomdata = await RoomModel.find({});
    res.status(200).send(roomdata);
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
};

module.exports = {
  roomRegister,
  usersData,
  roomsData
}
