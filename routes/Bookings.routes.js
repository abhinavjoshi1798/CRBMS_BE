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

    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const room = await RoomModel.findById(booking.roomId);
        const userDetails = await UserModel.findById(booking.bookingUserId);
        return {
          _id: booking?._id,
          Date: booking?.Date,
          timeIn: booking?.timeIn,
          timeOut: booking?.timeOut,
          bookingUserId: booking?.bookingUserId,
          roomId: booking?.roomId,
          meetingTitle: booking?.meetingTitle,
          meetingDetails: booking?.meetingDetails,
          meetingParticipants: booking?.meetingParticipants,
          numberOfParticipants: booking?.numberOfParticipants,
          isCancelled: booking?.isCancelled,
          roomCategory: room?.category,
          roomName: room?.name,
          roomFloor: room?.floor,
          roomDescription: room?.description,
          roomSitingCapacity: room?.seater,
          roomCity: room?.city,
          roomBuilding: room?.building,
          bookedBy: userDetails?.name,
          bookedPersonEmail: userDetails?.email,
          bookedPersonRole: userDetails?.role,
          bookedPersonEmployeeId: userDetails?.employeeId,
          bookedPersonCity: userDetails?.city,
          bookedPersonBuilding: userDetails?.building,
        };
      })
    );

    res.status(200).send({ Bookings: bookingsWithDetails });
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

// bookingRouter.get("/details/:bookingId", async (req, res) => {
//   const { bookingId } = req.params;
//   try {
//     const bookingdetail = await BookingModel.findById({ _id: bookingId })
//     if (bookingdetail) {
//       res.status(200).send({ bookingdetails: bookingdetail })
//     }
//   } catch (err) {
//     res.status(400).send({ err: err.message });
//   }
// })


bookingRouter.get("/details/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  try {
    const bookingdetail = await BookingModel.findById(bookingId); 
    if (bookingdetail) {
      res.status(200).send({ bookingdetails: bookingdetail });
    } else {
      res.status(404).send({ error: "Booking not found" }); 
    }
  } catch (err) {
    res.status(500).send({ error: err.message }); 
  }
});


bookingRouter.patch("/update/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const booking = await BookingModel.findById(_id);
    if (!booking) {
      return res.status(404).send({ error: "Booking not found" });
    }

    const newBooking = {
      // user should not be able to update the date
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

    // Validate required fields
    if (
      !newBooking.Date ||
      !newBooking.timeIn ||
      !newBooking.timeOut ||
      !newBooking.meetingTitle
    ) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const updatedBooking = await BookingModel.findOneAndUpdate(
      { _id },
      newBooking,
      { new: true } // return the modified document
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "a76102338@gmail.com",
        pass: "anpc bwxl vaec qstg",
      },
    });

    for (let i = 0; i < updatedBooking.meetingParticipants.length; i++) {
      const participantEmail = updatedBooking.meetingParticipants[i];
      const mailOptions = {
        from: "a76102338@gmail.com",
        to: participantEmail,
        subject:
          "Meeting with Title: " +
          updatedBooking.meetingTitle +
          " is cancelled",
        text: `Dear Sir/Madam,

        You are being informed by this email that the meeting titled "${updatedBooking.meetingTitle}" scheduled on ${updatedBooking.Date} from ${updatedBooking.timeIn} to ${updatedBooking.timeOut} has been cancelled.
        
        Meeting details: ${updatedBooking.meetingDetails}
        
        Please disregard any previous notifications regarding this meeting.
        
        We apologize for any inconvenience this may cause.
        
        Best regards,
        [Your Name/Organization]
        `,
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
      msg: `Booking with _id: ${updatedBooking._id} has been updated and Email has been sent to all the participants`,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = {
  bookingRouter,
};
