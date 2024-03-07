const express = require("express");
const { BookingModel } = require("../model/Booking.model");
const moment = require("moment");
const nodemailer = require("nodemailer");
const { RoomModel } = require("../model/Room.model");
const { roomsData } = require("../controllers/adminController");
const { UserModel } = require("../model/User.model");

const bookingRouter = express.Router();

bookingRouter.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) {
      return res.status(400).send({
        err: "user Id is required in params",
      });
    }

    const bookings = await BookingModel.find({
      bookingUserId: userId,
    });

    if (bookings.length === 0) {
      return res.status(404).send({ message: "Bookings not found" });
    }

    // Fetch details of each booking including room and user details
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

    // Separate bookings into upcoming, previous, and cancelled
    const currentDateTime = moment();
    const upcomingBookings = [];
    const previousBookings = [];
    const cancelledBookings = [];

    bookingsWithDetails.forEach((booking) => {
      const bookingDateTime = moment(
        `${booking.Date} ${booking.timeIn}`,
        "DD-MM-YYYY hh:mm A"
      );

      if (booking.isCancelled) {
        cancelledBookings.push(booking);
      } else if (bookingDateTime.isSameOrAfter(currentDateTime)) {
        upcomingBookings.push(booking);
      } else {
        previousBookings.push(booking);
      }
    });

    // Sort upcoming bookings in ascending order
    upcomingBookings.sort((a, b) => {
      const dateTimeA = moment(`${a.Date} ${a.timeIn}`, "DD-MM-YYYY hh:mm A");
      const dateTimeB = moment(`${b.Date} ${b.timeIn}`, "DD-MM-YYYY hh:mm A");
      return dateTimeA.diff(dateTimeB);
    });

    // Sort previous bookings in descending order
    previousBookings.sort((a, b) => {
      const dateTimeA = moment(`${a.Date} ${a.timeIn}`, "DD-MM-YYYY hh:mm A");
      const dateTimeB = moment(`${b.Date} ${b.timeIn}`, "DD-MM-YYYY hh:mm A");
      return dateTimeB.diff(dateTimeA);
    });

    // Sort cancelled bookings in descending order
    cancelledBookings.sort((a, b) => {
      const dateTimeA = moment(`${a.Date} ${a.timeIn}`, "DD-MM-YYYY hh:mm A");
      const dateTimeB = moment(`${b.Date} ${b.timeIn}`, "DD-MM-YYYY hh:mm A");
      return dateTimeB.diff(dateTimeA);
    });

    res.status(200).send({
      upcomingBookings,
      previousBookings,
      cancelledBookings,
    });
  } catch (err) {
    console.error("Error in bookingRouter:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

bookingRouter.get("/cancel/:booking_id", async (req, res) => {
  const { booking_id } = req.params;

  try {
    const booking = await BookingModel.findById(booking_id);

    if (!booking) {
      return res.status(404).send({ msg: "Booking not found" });
    }

    if (booking.isCancelled) {
      return res.status(200).send({ msg: "Booking is already cancelled" });
    }

    const updatedBooking = await BookingModel.findByIdAndUpdate(
      booking_id,
      {
        isCancelled: true,
        dateCreated: Date.now(),
      },
      { new: true }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "a76102338@gmail.com",
        pass: "anpc bwxl vaec qstg",
      },
    });

    const promises = booking.meetingParticipants.map(
      async (participantEmail) => {
        const mailOptions = {
          from: "a76102338@gmail.com",
          to: participantEmail,
          subject: `Meeting with Title: ${booking.meetingTitle} is cancelled`,
          text: `Dear Sir/Madam,\n\nYou are being informed by this email that the meeting titled "${booking.meetingTitle}"\nscheduled on ${booking.Date} from ${booking.timeIn} to ${booking.timeOut} has been cancelled.\n\nMeeting details: ${booking.meetingDetails}`,
        };

        try {
          const info = await transporter.sendMail(mailOptions);
          console.log(`Email sent to ${participantEmail}: ${info.response}`);
        } catch (error) {
          console.error(`Error sending email to ${participantEmail}:`, error);
          throw error; // Rethrow the error to stop the loop if there's an error sending email
        }
      }
    );

    await Promise.all(promises);

    res.status(200).send({
      msg: `Booking with _id: ${booking_id} has been cancelled. An email has been sent to all the participants.`,
      updatedBooking,
    });
  } catch (err) {
    console.error("Error in bookingRouter:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

bookingRouter.get("/details/:bookingId", async (req, res) => {
  const { bookingId } = req.params;

  try {
    const bookingDetail = await BookingModel.findById(bookingId);

    if (!bookingDetail) {
      return res.status(404).send({ error: "Booking not found" });
    }

    res.status(200).send({ bookingDetails: bookingDetail });
  } catch (err) {
    console.error("Error in bookingRouter:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

bookingRouter.patch("/update/:_booking_id", async (req, res) => {
  const { _booking_id } = req.params;
  try {
    const booking = await BookingModel.findById(_booking_id);
    if (!booking) {
      return res.status(404).send({ error: "Booking not found" });
    }
    if (booking.isCancelled === true) {
      return res.status(400).send({ msg: "Meeting is already cancelled." });
    }

    const newBooking = {
      // user should not be able to update the date
      Date: booking?.Date,
      timeIn: req.body.timeIn, //FE
      timeOut: req.body.timeOut, //FE
      bookingUserId: req.body.loggedInUserId,
      roomId: booking?.roomId,
      meetingTitle: booking?.meetingTitle,
      meetingDetails: req.body.meetingDetails, //FE
      meetingParticipants: req.body.meetingParticipants, //FE
      numberOfParticipants: req.body.numberOfParticipants, //FE
      isCancelled: booking?.isCancelled,
      new: true,
      dateCreated: Date.now(),
    };

    // Validate required fields
    if (
      !newBooking.Date ||
      !newBooking.timeIn ||
      !newBooking.timeOut ||
      !newBooking.meetingTitle ||
      !newBooking.meetingDetails ||
      newBooking.meetingParticipants.length === 0
    ) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const updatedBooking = await BookingModel.findOneAndUpdate(
      { _id: _booking_id },
      newBooking,
      { new: true }
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
        subject: `Meeting with Title: ${updatedBooking.meetingTitle} is updated`,
        text: `Dear Sir/Mam,
        
        This is to inform you that there have been updates made to the meeting titled: "${
          updatedBooking.meetingTitle
        }".
        
        The meeting details have been modified as follows:
        
        - Date: ${new Date(updatedBooking.Date).toDateString()}
        - Time: ${updatedBooking.timeIn} to ${updatedBooking.timeOut}
        - Meeting Details: ${updatedBooking.meetingDetails}
        
        Please review these changes carefully. 
        
        Thank you for your attention to this matter.
        
        Best regards,
        [Your Name/Organization Name]`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${participantEmail}`);
    }

    res.status(200).send({
      msg: `Booking with _id: ${updatedBooking._id} has been updated and Email has been sent to all the participants`,
      updatedBooking,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = {
  bookingRouter,
};
