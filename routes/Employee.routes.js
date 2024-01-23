// routes are controller only . MVC Model
const express = require("express");
require("dotenv").config();
const { RoomModel } = require("../model/Room.model");

const employeeRouter = express.Router();

employeeRouter.get("/dashboard", async (req, res) => {
  try {
    const conferenceRoomData = await RoomModel.find({category:"cr"})
    const meetingRoomData = await RoomModel.find({category:"mr"})
     
      res.status(200).send({ roomData: {
        "conferenceRoomData":conferenceRoomData,
        "meetingRoomData":meetingRoomData} });
    }catch (err) {
    res.status(400).send({ err: err.message });
  }
});

module.exports = {
  employeeRouter
};
