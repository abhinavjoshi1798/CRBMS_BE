// routes are controller only . MVC Model
const express = require("express");
require("dotenv").config();
const { RoomModel } = require("../model/Room.model");
const { UserModel } = require("../model/User.model");

const employeeRouter = express.Router();

employeeRouter.get("/dashboard", async (req, res) => {
  try {
    const userObj = await UserModel.findOne({ _id: req.body.loggedInUserId });
    const conferenceRoomData = await RoomModel.find({ category: "cr" });
    const meetingRoomData = await RoomModel.find({ category: "mr" });

    res.status(200).send({
      roomData: {
        conferenceRoomData: conferenceRoomData,
        meetingRoomData: meetingRoomData,
      },
      user: userObj,
    });
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

employeeRouter.patch("/dashboard/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const newBooking = req.body.newBooking;
  try {
    const room = await RoomModel.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Add the new booking to the bookings array
    room.bookings.push(newBooking);

    // Save the updated room
    const updatedRoom = await room.save();

    res.json(updatedRoom);
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

module.exports = {
  employeeRouter,
};
