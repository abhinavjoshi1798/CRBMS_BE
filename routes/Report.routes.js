const { BookingModel } = require("../model/Booking.model");
const { RoomModel } = require("../model/Room.model");
const { UserModel } = require("../model/User.model");

const express = require("express");

const reportRouter = express.Router();

reportRouter.get("/", async (req, res) => {
  try {
    // Fetch all rooms
    const rooms = await RoomModel.find();

    // Initialize an empty array to store booking counts for all rooms
    const allRoomsBookingCounts = [];

    // Iterate over each room
    for (const room of rooms) {
      // Fetch bookings for the current room that are not cancelled
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
                    { $arrayElemAt: [{ $split: ["$Date", " "] }, 2] }, // Year
                    "-",
                    {
                      $switch: {
                        branches: [
                          {
                            case: {
                              $eq: [
                                {
                                  $arrayElemAt: [{ $split: ["$Date", " "] }, 1],
                                },
                                "01",
                              ],
                            },
                            then: "01",
                          },
                          {
                            case: {
                              $eq: [
                                {
                                  $arrayElemAt: [{ $split: ["$Date", " "] }, 1],
                                },
                                "02",
                              ],
                            },
                            then: "02",
                          },
                          {
                            case: {
                              $eq: [
                                {
                                  $arrayElemAt: [{ $split: ["$Date", " "] }, 1],
                                },
                                "03",
                              ],
                            },
                            then: "03",
                          },
                          {
                            case: {
                              $eq: [
                                {
                                  $arrayElemAt: [{ $split: ["$Date", " "] }, 1],
                                },
                                "04",
                              ],
                            },
                            then: "04",
                          },
                          {
                            case: {
                              $eq: [
                                {
                                  $arrayElemAt: [{ $split: ["$Date", " "] }, 1],
                                },
                                "05",
                              ],
                            },
                            then: "05",
                          },
                          {
                            case: {
                              $eq: [
                                {
                                  $arrayElemAt: [{ $split: ["$Date", " "] }, 1],
                                },
                                "06",
                              ],
                            },
                            then: "06",
                          },
                          {
                            case: {
                              $eq: [
                                {
                                  $arrayElemAt: [{ $split: ["$Date", " "] }, 1],
                                },
                                "07",
                              ],
                            },
                            then: "07",
                          },
                          {
                            case: {
                              $eq: [
                                {
                                  $arrayElemAt: [{ $split: ["$Date", " "] }, 1],
                                },
                                "08",
                              ],
                            },
                            then: "08",
                          },
                          {
                            case: {
                              $eq: [
                                {
                                  $arrayElemAt: [{ $split: ["$Date", " "] }, 1],
                                },
                                "09",
                              ],
                            },
                            then: "09",
                          },
                          {
                            case: {
                              $eq: [
                                {
                                  $arrayElemAt: [{ $split: ["$Date", " "] }, 1],
                                },
                                "10",
                              ],
                            },
                            then: "10",
                          },
                          {
                            case: {
                              $eq: [
                                {
                                  $arrayElemAt: [{ $split: ["$Date", " "] }, 1],
                                },
                                "11",
                              ],
                            },
                            then: "11",
                          },
                          {
                            case: {
                              $eq: [
                                {
                                  $arrayElemAt: [{ $split: ["$Date", " "] }, 1],
                                },
                                "12",
                              ],
                            },
                            then: "12",
                          },
                        ],
                        default: "01",
                      },
                    }, // Month
                    "-",
                    { $arrayElemAt: [{ $split: ["$Date", " "] }, 0] }, // Day
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

      // Push booking counts for the current room to the array
      allRoomsBookingCounts.push({
        room: room.name, // Assuming room has a name field, you can change this as per your schema
        bookingCounts,
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
