const io = require("socket.io")()
const {userModel,messageModel,groupModel} = require("./models/userModel")

const socketApi = {
    io
}
io.on("connection",socket=>{
    console.log("connected")
    socket.on("join-user",async userid=>{
        const userFind = await userModel.findById(userid)
        userFind.socketid = socket.id
        await userFind.save()

        const allUsers = await userModel.find({
            socketid:{$nin:["",socket.id]},
            _id:{$nin:[userid]}
        })
        allUsers.forEach(user=>{
            socket.emit("users-show",{
                picture:user.picture,
                name:user.name,
                id:user._id,
                lastMessage:"Hello !"
            })
        })
        socket.broadcast.emit("users-show",{
            picture:userFind.picture,
            name:userFind.name,
            id:userFind._id,
            lastMessage:"Hello !"
        })
        const allGroups = await groupModel.find({
            users:{$in:userid}
        })
        socket.emit("groups-show",allGroups)
    })

    socket.on("send-message",async msg=>{
        const recierId = await userModel.findById(msg.recieverid)
        const senderId = await userModel.findById(msg.senderid)
        await messageModel.create({message:msg.message,senderid:msg.senderid,recieverid:msg.recieverid})
        if(!recierId){
            const groupId = await groupModel.findById(msg.recieverid).populate("users")
            if(!groupId){
                return
            }
            groupId.users.forEach(user=>{
                socket.to(user.socketid).emit("recieved-message-group",{msg,senderId})
            })
        }
        if(recierId){
            socket.to(recierId.socketid).emit("recieved-message-user",{msg,senderId})
        }
    })

    socket.on("get-message",async user=>{
        const recierId = await userModel.findById(user.recieverid)
        if(!recierId){
            const groupId = await groupModel.findById(user.recieverid)
            if(!groupId){
                return
            }
            const allMessages = await messageModel.find({
                recieverid:user.recieverid
            }).populate("senderid")
            socket.emit("get-message",allMessages)
        }
        if(recierId){
            const allMessages = await messageModel.find({
                $or:[
                    {
                        senderid:user.senderid,
                        recieverid:user.recieverid,
                    },
                    {
                        senderid:user.recieverid,
                        recieverid:user.senderid,
                    }
                ]
            }).populate("senderid")
            socket.emit("get-message",allMessages)
        }
        

    })

    socket.on("group-create",async group=>{
        const groupFind = await groupModel.findOne({name:group.groupName})
        if(groupFind){
            return socket.emit("group-not-created","allready group created")
        }
        const groupCreate = await groupModel.create({name:group.groupName,createrid:group.senderid})
        groupCreate.users.push(group.senderid)
        await groupCreate.save()
        socket.emit("group-created",groupCreate._id)
    })

    socket.on("join-group",async group=>{
        const groupFind = await groupModel.findOne({name:group.groupName})
        if(!groupFind){
            return socket.emit("group-not-created","Group not found")
        }
        groupFind.users.push(group.currentUserId)
        await groupFind.save()
        socket.emit("join-grouped",groupFind)
    })

    socket.on("disconnect",async ()=>{
        console.log("disconnected")
        await userModel.findOneAndUpdate({socketid:socket.id},{socketid:""},{new:true})
    })

})

module.exports = socketApi