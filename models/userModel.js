const mongoose = require("mongoose")
const d = new Date()

const userSchema = new mongoose.Schema({
    picture:String,
    name:String,
    email:String,
    socketid:{type:String,default:""},
    password:String,
},{timestamps:true,versionKey:false})
const userModel = mongoose.model("user",userSchema)

const messageSchema = new mongoose.Schema({
    recieverid:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    senderid:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    message:String
})
const messageModel = mongoose.model("message",messageSchema)

const groupSchema = new mongoose.Schema({
    name:String,
    createrid:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    users:[{type:mongoose.Schema.Types.ObjectId,ref:"user"}],
    picture:{type:String,default:""},
})
const groupModel = mongoose.model("group",groupSchema)

module.exports = {userModel,messageModel,groupModel}