const mongoose = require("mongoose");
const roomSchema = mongoose.Schema({
    category:{type:String,required:true},
    name:{type:String,required:true},
    floor:{type:Number,required:true},
    description:{type:String,required:true},
    seater:{type:Number,required:true},
    city:{type:String,required:true},
    building:{type:String,required:true},
    bookings: [{
        date: { type: String },
        timein: { type: String },
        timeout: { type: String },
        bookingUserId:{type:String},
        bookingUserName:{type:String}
    }]
},{
    versionKey:false
})

const RoomModel = mongoose.model("room",roomSchema)

module.exports={
    RoomModel
}