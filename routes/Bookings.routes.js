const express = require("express");
const { BookingModel } = require("../model/Booking.model");

const nodemailer = require("nodemailer");
const { RoomModel } = require("../model/Room.model");
const { roomsData } = require("../controllers/adminController");
const { UserModel } = require("../model/User.model");

const bookingRouter = express.Router();

bookingRouter.get("/:employeeId", async (req, res) => {
  const { employeeId } = req.params;
  try {
    const bookings = await BookingModel.find({ bookingUserId: employeeId });
    bookings.map((el) => {
      return el.isCancelled === false;
    });

    const bookingsWithDetails = await Promise.all(bookings.map(async (booking) => {
      const room = await RoomModel.findById(booking.roomId);
      const userDetails = await UserModel.findById(booking.bookingUserId);
      return {
        _id:booking._id,
        Date:booking.Date,
        timeIn:booking.timeIn,
        timeOut:booking.timeOut,
        bookingUserId:booking.bookingUserId,
        roomId: booking.roomId,
        meetingTitle:booking.meetingTitle,
        meetingDetails:booking.meetingDetails,
        meetingParticipants:booking.meetingParticipants,
        numberOfParticipants:booking.numberOfParticipants,
        isCancelled:booking.isCancelled,
        roomCategory:room.category,
        roomName:room.name,
        roomFloor:room.floor,
        roomDescription:room.description,
        roomSitingCapacity:room.seater,
        roomCity:room.city,
        roomBuilding:room.building,
        bookedBy:userDetails.name,
        bookedPersonEmail:userDetails.email,
        bookedPersonRole:userDetails.role,
        bookedPersonEmployeeId:userDetails.employeeId,
        bookedPersonCity:userDetails.city,
        bookedPersonBuilding:userDetails.building
        // booking:booking,
        // room: room,
        // userDetails: userDetails
      };
    }));
    
    res.status(200).send({ Bookings: bookingsWithDetails});
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

bookingRouter.patch("/cancel/:_id", async (req, res) => {
  const { _id } = req.params;
  const booking = await BookingModel.findById({ _id: _id });
  if (booking.isCancelled === true) {
    res.status(200).send({ msg: "Booking is already cancelled" });
  } else {
    try {
      const bookings = await BookingModel.findByIdAndUpdate(
        { _id: _id },
        req.body
      );

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "a76102338@gmail.com",
          pass: "anpc bwxl vaec qstg",
        },
      });

      for (let i = 0; i < bookings.meetingParticipants.length; i++) {
        const participantEmail = bookings.meetingParticipants[i];
        const mailOptions = {
          from: "a76102338@gmail.com",
          to: participantEmail,
          subject:
            "Meeting with Title: " + bookings.meetingTitle + `is cancelled`,
          text: `Dear Sir/Mam\nYou are being informed by this email that meeting with titled ${bookings.meetingTitle}\nscheduled on ${bookings.Date} from ${bookings.timeIn} to ${bookings.timeOut}.\nMeeting details: ${bookings.meetingDetails} \n has been cancelled`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(`Error sending email to ${participantEmail}: ${error}`);
          } else {
            console.log(`Email sent to ${participantEmail}: ${info.response}`);
          }
        });
      }

      res.status(200).send({
        msg: `Booking with _id: ${bookings._id} has been cancelled. and Email has been sent to app the participants`,
      });
    } catch (err) {
      res.status(400).send({ err: err.message });
    }
  }
});

bookingRouter.patch("/update/:_id", async (req, res) => {
  const { _id } = req.params;
  const booking = await BookingModel.findById({ _id: _id });
  const newBooking = {
    Date: req.body.Date,
    timeIn: req.body.timeIn,
    timeOut: req.body.timeOut,
    bookingUserId: req.body.loggedInUserId,
    roomId: booking.roomId,
    meetingTitle: req.body.meetingTitle,
    meetingDetails: req.body.meetingDetails,
    meetingParticipants: req.body.meetingParticipants,
    numberOfParticipants: req.body.numberOfParticipants,
    isCancelled: req.body.isCancelled,
  };
  try {
    const bookings = await BookingModel.findByIdAndUpdate(
      { _id: _id },
      newBooking
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "a76102338@gmail.com",
        pass: "anpc bwxl vaec qstg",
      },
    });
    for (let i = 0; i < bookings.meetingParticipants.length; i++) {
      const participantEmail = bookings.meetingParticipants[i];
      const mailOptions = {
        from: "a76102338@gmail.com",
        to: participantEmail,
        subject:
          "Meeting with Title: " + bookings.meetingTitle + `is cancelled`,
        text: `Dear Sir/Mam\nYou are being informed by this email that meeting with titled ${bookings.meetingTitle}\nscheduled on ${bookings.Date} from ${bookings.timeIn} to ${bookings.timeOut}.\nMeeting details: ${bookings.meetingDetails} \n has been cancelled`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(`Error sending email to ${participantEmail}: ${error}`);
        } else {
          console.log(`Email sent to ${participantEmail}: ${info.response}`);
        }
      });
    }

    res.status(200).send({
      msg: `Booking with _id: ${bookings._id} has been Updated and Email has been sent to all the participants`,
    });
  } catch (err) {
    res.status(400).send({ err: err.message });
  }
});

module.exports = {
  bookingRouter,
};

// abc