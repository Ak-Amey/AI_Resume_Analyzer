const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

function authUser(req,res,next){
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message:"Token not provided. Please login to continue."
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({token});
    if(isTokenBlacklisted){
        return res.status(401).json({
            message:"Token is Invalid."
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRETS);
        req.user = decoded;
        next();
    }catch(err){
        return res.status(401).json({
            message:"Invalid token. Please login to continue."
        })
    }
}

module.exports = {
    authUser
}