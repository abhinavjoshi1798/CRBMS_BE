const express = require("express");
const { BookingModel } = require("../model/Booking.model");

const nodemailer = require("nodemailer");

const bookingRouter = express.Router();

bookingRouter.get("/:employeeId", async (req, res) => {
    const { employeeId } = req.params;
    try {
        const bookings = await BookingModel.find({ bookingUserId: employeeId });
        res.status(200).send({ Bookings: bookings });
    } catch (err) {
        res.status(400).send({ err: err.message });
    }
});

bookingRouter.patch("/cancel/:_id", async (req, res) => {
    const { _id } = req.params;
    const booking = await BookingModel.findById({_id:_id})
    if(booking.isCancelled === true){
        res.status(200).send({"msg":"Booking is already cancelled"})
    }else{
        try {
            const bookings = await BookingModel.findByIdAndUpdate(
                { _id: _id },
                req.body
            );
            console.log(bookings);
    
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
                    subject: "Meeting with Title: " + bookings.meetingTitle + `is cancelled`,
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
    
            res
                .status(200)
                .send({
                    msg: `Booking with _id: ${bookings._id} has been cancelled. and Email has been sent to app the participants`,
                });
        } catch (err) {
            res.status(400).send({ err: err.message });
        }
    }
    
});

bookingRouter.patch("/update/:_id", async (req, res) => {
    const { _id } = req.params;
    try {
        // const bookings = await BookingModel.findByIdAndUpdate({ _id: _id },req.body);
        res.status(200).send({ msg: `` });
    } catch (err) {
        res.status(400).send({ err: err.message });
    }
});

module.exports = {
    bookingRouter,
};
