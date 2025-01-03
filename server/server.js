//access to .env file
import 'dotenv/config'
import express from 'express';
//access to mongodb
import mongoose from 'mongoose';
//encrypt password
import bcrypt from 'bcrypt';
//avoid duplicated id
import { nanoid } from 'nanoid';
//generate token to check user access is valid
import jwt from 'jsonwebtoken';

// schema below
import User from './Schema/User.js';

const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true,
});

const formatDatatoSend = (user) => {
    const access_token = jwt.sign({id: user._id}, process.env.SECRET_ACCESS_KEY);

    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
    }
}

const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let isUsernameExists = await User.exists({"personal_info.username": username}).then(
        (result) => result)

    isUsernameExists ? username += nanoid().substring(0, 5) : "";

    return username;
}

server.post("/signup", (req, res) => {
    let { fullname, email, password } = req.body;

    // validating the data from frontend
    if(fullname.length < 3)
    {
        //403 means invalidatioin
        return res.status(403).json({"error": "Fullname must be at least 3 letters long"})
    }

    if(!email.length)
    {
        return res.status(403).json({"error": "Enter Email"})
    }

    if(!emailRegex.test(email))
    {
        return res.status(403).json({"error": "Email is invalid"})
    }

    if(!passwordRegex.test(password))
    {
        return res.status(403).json({"error": "Password should be 6 to 20 characters long with a nmeric, 1 lowercase and 1 uppercase letters"})
    }
    bcrypt.hash(password, 10, async (err, hased_password)=>{

        let username = await generateUsername(email);

        let user = new User({
            personal_info: {
                fullname, email, password: hased_password, username}
        })

        user.save().then((u)=>{
            return res.status(200).json(formatDatatoSend(u))
        })
        .catch(err=>{
            if(err.code == 11000)
            {
                return res.status(500).json({"error": "email already exists"});
            }
            return res.status(500).json({"error": err.message})
        })
    });

})

server.post("/signin", (req, res) => {
    let { email, password } = req.body;

    User.findOne({ "personal_info.email": email })
    .then((user) => {
        if(!user){
            return res.status(403).json({"error": "Email not found"});
        }

        bcrypt.compare(password, user.personal_info.password, (err, result)=>{
            if(err){
                return res.status(403).json({"error": "Error occured while login please try again"});
            }
            if(!result)
            {
                return res.status("403").json({"error": "Incorrect password"});
            }
            else{
                return res.status("200").json(formatDatatoSend(user));
            }
        });
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({"error": err.message});
    });
    
})

server.listen(PORT, () => {
    console.log('listening on port -> ' + PORT)
});
