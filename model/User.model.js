const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    pass:{type:String,required:true},
    role:{type:String,required:true},
    employeeId:{type:Number,required:true},
    city:{type:String,required:true},
    building:{type:String,required:true},
    new:{type:Boolean,require:true},
    dateCreated: { type: String, require: true },
    isDeleted:{type:Boolean,require:true}
},{
    versionKey:false
})

const UserModel = mongoose.model("user",userSchema)

module.exports={
    UserModel
}