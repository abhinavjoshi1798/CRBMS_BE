const { BookingModel } = require("../model/Booking.model");
const { RoomModel } = require("../model/Room.model");
const { UserModel } = require("../model/User.model");
const moment = require("moment");

const express = require("express");

const reportRouter = express.Router();

//Reports / Admin Dashboard
reportRouter.get("/", async (req, res) => {
  try {
    const rooms = await RoomModel.find();
    const allRoomsBookingCounts = [];

    for (const room of rooms) {
      const bookingCounts = await BookingModel.aggregate([
        {
          $match: { roomId: room._id.toString(), isCancelled: false },
        },
        {
          $addFields: {
            formattedDate: {
              $dateFromString: {
                dateString: {
                  $concat: [
                    { $arrayElemAt: [{ $split: ["$Date", "-"] }, 2] },
                    "-",
                    { $arrayElemAt: [{ $split: ["$Date", "-"] }, 1] },
                    "-",
                    { $arrayElemAt: [{ $split: ["$Date", "-"] }, 0] },
                  ],
                },
              },
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$formattedDate" } },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            month: { $substr: ["$_id", 5, 2] },
            year: { $substr: ["$_id", 0, 4] },
            count: 1,
          },
        },
        {
          $sort: { year: 1, month: 1 },
        },
      ]);

      allRoomsBookingCounts.push({
        room: room.name,
        bookingCounts,
      });
    }

    const Bookings = await BookingModel.find();
    const totalBookings = Bookings?.length;

    const users = await UserModel.find();
    const totalUsers = users?.length;
    let noOfAdmin = 0,
      noOfEmployee = 0;
    users?.forEach((el) => {
      if (el.role === "employee") {
        noOfEmployee++;
      }
      if (el.role === "admin") {
        noOfAdmin++;
      }
    });

    const roomsData = await RoomModel.find();
    const totalRooms = roomsData?.length;
    let noOfConferenceRoom = 0,
      noOfMeetingRoom = 0;
    roomsData?.forEach((el) => {
      if (el.category === "cr") {
        noOfConferenceRoom++;
      }
      if (el.category === "mr") {
        noOfMeetingRoom++;
      }
    });

    const { page = 1 } = req.query;
    const limit = 10; // Number of bookings per page
    const skip = (page - 1) * limit;

    const bookings = await BookingModel.find().skip(skip).limit(limit);

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

    bookingsWithDetails.sort((a, b) => {
      const dateTimeA = moment(`${a.Date} ${a.timeIn}`, "DD-MM-YYYY hh:mm A");
      const dateTimeB = moment(`${b.Date} ${b.timeIn}`, "DD-MM-YYYY hh:mm A");
      return dateTimeB.diff(dateTimeA);
    });

    const totalPages = Math.ceil(totalBookings / limit);

    res.status(200).send({
      Bookings: bookingsWithDetails,
      totalPages,
      currentPage: parseInt(page),
      allRoomsBookingCounts,
      TotalBookings: totalBookings,
      UsersData: {
        totalUsers,
        noOfAdmin,
        noOfEmployee,
      },
      roomsData: {
        totalRooms,
        noOfConferenceRoom,
        noOfMeetingRoom,
      },
    });
  } catch (err) {
    console.error("Error in reportRouter:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = {
  reportRouter,
};
