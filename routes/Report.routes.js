const { BookingModel } = require("../model/Booking.model");
const { RoomModel } = require("../model/Room.model");
const { UserModel } = require("../model/User.model");

const express = require("express");

const reportRouter = express.Router();



reportRouter.get("/", async (req, res) => {
  try {
      const rooms = await RoomModel.find();
      const allRoomsBookingCounts = [];

      for (const room of rooms) {
          const bookingCounts = await BookingModel.aggregate([
              {
                  $match: { roomId: room._id.toString(), isCancelled: false }
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
                                      { $arrayElemAt: [{ $split: ["$Date", "-"] }, 0] }
                                  ]
                              }
                          }
                      }
                  }
              },
              {
                  $group: {
                      _id: { $dateToString: { format: "%Y-%m", date: "$formattedDate" } },
                      count: { $sum: 1 }
                  }
              },
              {
                  $project: {
                      _id: 0,
                      month: { $substr: ["$_id", 5, 2] },
                      year: { $substr: ["$_id", 0, 4] },
                      count: 1
                  }
              },
              {
                  $sort: { year: 1, month: 1 }
              }
          ]);

          allRoomsBookingCounts.push({
              room: room.name,
              bookingCounts
          });
      }

      res.status(200).send({ allRoomsBookingCounts });
  } catch (err) {
      console.error("Error in reportRouter:", err);
      res.status(500).send({ error: "Internal server error" });
  }
});


module.exports = {
  reportRouter,
};
