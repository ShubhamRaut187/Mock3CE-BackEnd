const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const connection = require("./db");
const {UserModel} = require("./User.model");
const {EmployeeModel} = require("./Employee.model");



const app = express();

app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    res.send("Basic Route");
})

app.post("/signup",async(req,res)=>{
    const {Email,Password,ConfirmPassword} = req.body;
    
    if(Password !== ConfirmPassword){
        return res.send("Password Not Matched");
    }

    const Hashed_Password = bcrypt.hashSync(Password,8);
    const Hashed_ConfirmPassword = bcrypt.hashSync(ConfirmPassword,8);

    const new_user =new UserModel({
        Email,
        Password:Hashed_Password,
        ConfirmPassword:Hashed_ConfirmPassword
    })
    await new_user.save();
    res.send("SignUp Successfull!");

})

app.post("/login",async(req,res)=>{
    const {Email,Password} = req.body;
    const user = await UserModel.findOne({Email});

    if(!user){
        return res.send("Please SigUp Before Logging In");
    }

    const hash = user.Password;

    const Unhashed_Password = bcrypt.compareSync(Password,hash);

    if(Unhashed_Password){
        const token = jwt.sign({userId:user._id},"SecurityCode");
        // localStorage.setItem("LoginToken",token);
        res.send({"Message":"Login Successfull!","token":token});
    }
    else{
        res.send({"Message":"Failed to Login"});
    }

})

app.post("/employee",async(req,res)=>{
    const token = req.headers.authorization.split(" ")[1];
    const {FirstName,LastName,Email,Department,Salary} = req.body;

    if(!token){
        return res.send("Please Login");
    }

    jwt.verify(token,"SecurityCode",async(error,decoded)=>{
        if(decoded){
            const new_employee =new EmployeeModel({
                FirstName,
                LastName,
                Email,
                Department,
                Salary
            })
            await new_employee.save();
            res.send("Employee Added");
            
        }
        else{
            res.send("Login Again to Add Employee");
        }
    })
})

app.get("/employee",async(req,res)=>{
    const token = req.headers.authorization.split(" ")[1];

    if(!token){
        return res.send("Please Login");
    }

    jwt.verify(token,"SecurityCode",async(error,decoded)=>{
        if(decoded){
            const employees = await EmployeeModel.find({});
            res.send(employees);
        }
        else{
            res.send("Login Again");
        }
    })

})

app.patch("/employee/:id",async(req,res)=>{
    const token = req.headers.authorization.split(" ")[1];
    const {id}=req.params;
    const {FirstName,LastName,Email,Department,Salary} = req.body;
    if(!token){
        return res.send("Please Login");
    }

    jwt.verify(token,"SecurityCode",async(error,decoded)=>{
        if(decoded){
            const data={
                FirstName,
                LastName,
                Email,
                Department,
                Salary
            }
            const employees = await EmployeeModel.findOneAndUpdate({_id:id},data);
            res.send("Employee Updated");
        }
        else{
            res.send("Login Again");
        }
    })
})


app.delete("/employee/:id",async(req,res)=>{
    const token = req.headers.authorization.split(" ")[1];
    const {id} = req.params;
    if(!token){
        return res.send("Please Login");
    }

    jwt.verify(token,"SecurityCode",async(error,decoded)=>{
        if(decoded){
            await EmployeeModel.findOneAndDelete({_id:id});
            res.send("Employee Details Deleted")
        }
        else{
            res.send("Login Again");
        }
    })
})


app.get("/employee/:filter",async(req,res)=>{
    const token = req.headers.authorization.split(" ")[1];
    const {filter} = req.params;
    if(!token){
        return res.send("Please Login");
    }

    jwt.verify(token,"SecurityCode",async(error,decoded)=>{
        if(decoded){
            const employees = await EmployeeModel.find({Department:filter});
            res.send(employees);
        }
        else{
            res.send("Login Again");
        }
    })
})

app.listen(process.env.PORT,async()=>{
    try {
        await connection;
        console.log("Connected to Mongo and Server on port 8000");
    } catch (error) {
        console.log("Error connecting Mongo");
    }
})