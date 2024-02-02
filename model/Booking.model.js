const mongoose = require("mongoose");
const bookingSchema = mongoose.Schema({
    Date:{type:String,required:true},
    timeIn:{type:String,required:true},
    timeOut:{type:String,required:true},
    bookingUserId:{type:String, require:true},
    roomId:{type:String, require:true},
    meetingTitle:{type:String,required:true},
    meetingDetails:{type:String,required:true},
    meetingParticipants:{ type: [String], required: true },
    numberOfParticipants:{type:Number,required:true}
},   { 
    versionKey:false
})

const BookingModel = mongoose.model("booking",bookingSchema)

module.exports={
    BookingModel
}