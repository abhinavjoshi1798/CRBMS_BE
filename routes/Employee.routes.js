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
    const loggedInUserId = req.body.loggedInUserId; // Assuming loggedInUserId is sent in the request body
    if (!loggedInUserId) {
      return res.status(400).send({ error: "loggedInUserId is required" });
    }

    const userObj = await UserModel.findOne({ _id: loggedInUserId });
    if (!userObj) {
      return res.status(404).send({ error: "User not found" });
    }

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
    console.error("Error in employee/dashboard/ endpoint:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

employeeRouter.get("/dashboard/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    if (!roomId) {
      return res.status(400).send({ error: "Room ID is required" });
    }

    const bookings = await BookingModel.find({ roomId, isCancelled: false });

    if (!bookings || bookings.length === 0) {
      return res.status(404).send({ error: "No bookings found for this room" });
    }

    bookings.sort((a, b) => {
      const dateTimeA = moment(`${a.Date} ${a.timeIn}`, "DD-MM-YYYY hh:mm A");
      const dateTimeB = moment(`${b.Date} ${b.timeIn}`, "DD-MM-YYYY hh:mm A");
      return dateTimeB.diff(dateTimeA);
    });

    res.status(200).send({ bookings });
  } catch (err) {
    console.error("Error in /dashboard/:roomId endpoint:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

employeeRouter.get("/dashboard/monthlybookings/:roomId/:month", async (req, res) => {
    const { roomId, month } = req.params;
    try {
      if(!roomId || !month || month.length != 2){
       return res.status(400).send({msg:"RoomId or Month must be needed"})
      }      
   
      const bookings = await BookingModel.find({ roomId, isCancelled: false });
      if(bookings.length === 0){
        return res.status(400).send({msg:"There are no bookings for the particular room"})
      }     

      const bookingsOnTargetMonth = bookings.filter((booking) => {
        let [day, bookingMonth, year] = booking.Date.split(" ");
        return bookingMonth === month;
      });

      if(bookingsOnTargetMonth.length === 0 ){
        return res.status(400).send({msg:"There are no bookings for given room for the particular month"})
      }
     
      res.status(200).send({ bookings: bookingsOnTargetMonth });
    } catch (err) {
      console.error("Error in /dashboard/bookingsMonthWise/:roomId/:month endpoint:",err);
      res.status(500).send({ error: "Internal server error" });
    }
  }
);



employeeRouter.get("/dashboard/:roomId/:selectedDate", async (req, res) => {
  const { roomId, selectedDate } = req.params;
  try {
    if (!roomId || !selectedDate) {
      return res
        .status(400)
        .send({ error: "Room ID and selected date are required" });
    }

    const bookings = await BookingModel.find({ roomId, isCancelled: false });
    const bookingsOnTargetDate = bookings.filter(
      (booking) => booking.Date === selectedDate
    );

    if (bookingsOnTargetDate.length === 0) {
      return res
        .status(200)
        .send({ msg: "There are no bookings on this particular date" });
    }

    res.status(200).send({ bookings: bookingsOnTargetDate });
  } catch (err) {
    console.error("Error in /dashboard/:roomId/:selectedDate endpoint:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

employeeRouter.post("/dashboard/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const {
    Date,
    timeIn,
    timeOut,
    loggedInUserId,
    meetingTitle,
    meetingDetails,
    meetingParticipants,
    numberOfParticipants,
  } = req.body;

  try {
    if (
      !Date ||
      !timeIn ||
      !timeOut ||
      !loggedInUserId ||
      !meetingTitle ||
      !meetingParticipants ||
      !numberOfParticipants
    ) {
      return res
        .status(400)
        .send({ error: "Missing required fields for booking" });
    }

    const existingBooking = await BookingModel.findOne({
      roomId,
      Date,
      $or: [
        {
          $and: [{ timeIn: { $lte: timeIn } }, { timeOut: { $gt: timeIn } }],
        },
        {
          $and: [{ timeIn: { $lt: timeOut } }, { timeOut: { $gte: timeOut } }],
        },
      ],
    });

    if (existingBooking) {
      return res.status(400).send({
        error:
          "There is a conflicting booking for the same room and time slot.",
      });
    }

    const bookingObj = {
      Date, // From FE
      timeIn, // From FE
      timeOut, // From FE
      bookingUserId: loggedInUserId, // From Auth Middleware
      roomId, //From Params
      meetingTitle, // From FE
      meetingDetails, // From FE
      meetingParticipants, // From FE
      numberOfParticipants, // From FE
      isCancelled: false, // Created Here only
      new: false, // Created Here only
      dateCreated: Date.now, // Created Here only
    };

    const booking = new BookingModel(bookingObj);
    await booking.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "a76102338@gmail.com",
        pass: "anpc bwxl vaec qstg",
      },
    });

    for (const participantEmail of meetingParticipants) {
      const mailOptions = {
        from: "a76102338@gmail.com",
        to: participantEmail,
        subject: "Meeting Invitation: " + meetingTitle,
        text: `Dear Sir/Mam,\n\nYou are invited to a meeting titled ${meetingTitle}\nscheduled on ${Date} from ${timeIn} to ${timeOut}.\n\nMeeting details: ${meetingDetails}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error(`Error sending email to ${participantEmail}: ${error}`);
        } else {
          console.log(`Email sent to ${participantEmail}: ${info.response}`);
        }
      });
    }

    res
      .status(200)
      .send({ msg: "Booking has been made, and emails sent to participants" });
  } catch (err) {
    console.error("Error in /dashboard/:roomId POST endpoint:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = {
  employeeRouter,
};
