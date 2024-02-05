const express = require("express");
require("dotenv").config();
const moment = require("moment");
const { RoomModel } = require("../model/Room.model");
const { UserModel } = require("../model/User.model");
const { BookingModel } = require("../model/Booking.model");

const nodemailer = require("nodemailer");

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

employeeRouter.get("/dashboard/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const bookings = await BookingModel.find({ roomId: roomId });

    bookings.sort((a, b) => {
      const dateTimeA = moment(`${a.Date} ${a.timeIn}`, "DD-MM-YYYY hh:mm A");
      const dateTimeB = moment(`${b.Date} ${b.timeIn}`, "DD-MM-YYYY hh:mm A");
      const dateComparison = dateTimeB.diff(dateTimeA);
      if (dateComparison !== 0) {
        return dateComparison;
      }
      return dateTimeB.diff(dateTimeA, "seconds");
    });
    res.status(200).send({ bookings: bookings });
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

employeeRouter.get("/dashboard/:roomId/:selectedDate", async (req, res) => {
  const { roomId, selectedDate } = req.params;
  try {
    const bookings = await BookingModel.find({ roomId: roomId });
    const bookingsOnTargetDate = bookings.filter(
      (booking) => booking.Date === selectedDate
    );
    if (bookingsOnTargetDate.length === 0) {
      res
        .status(200)
        .send({ msg: "There are no bookings on this particular date" });
    } else {
      res.status(200).send({ bookings: bookingsOnTargetDate });
    }
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

employeeRouter.post("/dashboard/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const bookingObj = {
    Date: req.body.Date,
    timeIn: req.body.timeIn,
    timeOut: req.body.timeOut,
    bookingUserId: req.body.loggedInUserId,
    roomId: roomId,
    meetingTitle: req.body.meetingTitle,
    meetingDetails: req.body.meetingDetails,
    meetingParticipants: req.body.meetingParticipants,
    numberOfParticipants: req.body.numberOfParticipants,
    isCancelled:false
  };
  try {
    const booking = new BookingModel(bookingObj);
    await booking.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "abhinavjoshi1798@gmail.com",
        pass: "zboy mvtn kjle ycmc",
      },
    });

    for (let i = 0; i < req.body.meetingParticipants.length; i++) {
      const participantEmail = req.body.meetingParticipants[i];
      const mailOptions = {
        from: "abhinavjoshi1798@gmail.com",
        to: participantEmail,
        subject: "Meeting Invitation: " + req.body.meetingTitle,
        text: `Dear Sir/Mam\nYou are invited to a meeting titled ${req.body.meetingTitle}\nscheduled on ${req.body.Date} from ${req.body.timeIn} to ${req.body.timeOut}.\nMeeting details: ${req.body.meetingDetails}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(`Error sending email to ${participantEmail}: ${error}`);
        } else {
          console.log(`Email sent to ${participantEmail}: ${info.response}`);
        }
      });
    }

    res
      .status(200)
      .send({ msg: "Booking has been made, and emails sent to participants" });
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

module.exports = {
  employeeRouter,
};
