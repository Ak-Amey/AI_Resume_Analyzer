const userModel = require("../models/user.model");

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

    
}

module.exports = {
    registerUserController
}
