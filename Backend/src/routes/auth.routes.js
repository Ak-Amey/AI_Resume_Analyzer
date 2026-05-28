const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post("/register",authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @desc Login a user with email and password
 * @access Public
 */
authRouter.post("/login",authController.loginUserController)

/**
 * @name logoutUserController
 * @desc Logout a user, expects token in the request and token will be added to blacklist
 * @access Public
 */
authRouter.get("/logout",authController.logoutUserController)

/**
 * @route GET /api/auth/getuser
 * @desc Get user details, expects token in the request and token will be verified
 * @access Private
 */
authRouter.get("/getuser",authMiddleware.authUser, authController.getUserController)

module.exports = authRouter;

