const mongoose = require("mongoose");
const roomSchema = mongoose.Schema({
    category:{type:String,required:true},
    name:{type:String,required:true},
    floor:{type:Number,required:true},
    description:{type:String,required:true},
    seater:{type:Number,required:true},
    city:{type:String,required:true},
    building:{type:String,required:true}
},{
    versionKey:false
})

const RoomModel = mongoose.model("room",roomSchema)

module.exports={
    RoomModel
}