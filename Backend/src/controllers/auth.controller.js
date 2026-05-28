const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

/**
 * @name registerUserController
 * @desc Register a new user, expects username, email and password in the request
 * @access Public
 */

async function registerUserController(req,res){
    const {username,email,password} = req.body

    if(!username || !email || !password){
        return res.status(400).json({
            message:"Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or:[ 
            {username},
            {email}
        ]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message:"Account already exists with username or email address"
        })
    }

    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = new userModel({
        username,
        email,
        password:hashedPassword
    })

    await newUser.save();

    const token = jwt.sign(
        { id: newUser._id, username: newUser.username },
        process.env.JWT_SECRETS,
        { expiresIn: "1d" }
    );

    res.cookie("token", token)

    res.status(201).json({
        message:"User registered successfully",
        user:{
            id:newUser._id,
            username:newUser.username,
            email:newUser.email
        }
    })
    
}


/**
 * @name loginUserController
 * @desc Login a user, expects email and password in the request
 * @access Public
 */

async function loginUserController(req,res){
    const {email,password } = req.body

    if(!email || !password){
        return res.status(400).json({
            message:"Please provide email and password"
        })
    }

    const user = await userModel.findOne({email});
    if(!user){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRETS,
        { expiresIn: "1d" }
    );

    res.cookie("token", token)

    res.status(200).json({
        message:"User logged in successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}

/**
 * @name logoutUserController
 * @desc Logout a user, expects token in the request and token will be added to blacklist
 * @access Public
 */
async function logoutUserController(req,res){
    const token = req.cookies.token;

    if(token){
        await tokenBlacklistModel.create({token})
    }

    res.clearCookie("token")
    res.status(200).json({
        message: "User logged out successfully"
    });
}


/**
 * @name getUserController
 * @desc get the current logged in user details
 * @access Private
 */
async function getUserController(req, res) {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }
    res.status(200).json({
        message: "User details fetched successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getUserController
}
