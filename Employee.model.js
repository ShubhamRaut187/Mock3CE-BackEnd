const mongoose = require("mongoose");

const employeeschema = mongoose.Schema({
    FirstName:String,
    LastName:String,
    Email:String,
    Department:String,
    Salary:Number
})

const EmployeeModel = mongoose.model("employee",employeeschema);

module.exports = {EmployeeModel};