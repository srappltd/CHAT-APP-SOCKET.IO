const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")
const d = new Date()

const userSchema = new mongoose.Schema({
    picture:String,
    name:{type:String},
    username:{type:String},
    email:{type:String,required:true,unique:true},
    mobile:{type:String,default:""},
    googleid:{type:String,default:""},
    socketid:{type:String,default:""},
},{timestamps:true,versionKey:false})
userSchema.plugin(plm,{ usernameField: 'email' })
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