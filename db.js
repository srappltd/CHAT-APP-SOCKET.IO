const mongoose = require('mongoose')
async function Mongoose(DATABASE){
await mongoose.connect(DATABASE)
}
module.exports = {Mongoose}