const mongoose = require("mongoose");

const userschema = mongoose.Schema({
    Email:String,
    Password:String,
    ConfirmPassword:String
})

const UserModel = mongoose.model("user",userschema);

module.exports = {UserModel};