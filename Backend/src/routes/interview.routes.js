const express = require('express');
const authMiddleware = require("../middleware/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const interviewRouter = express.Router();
const upload = require("../middleware/file.middleware");

/**
 * @route POST /api/interview/
 * @desc Generate interview report based on the resume, self describe and job describe
 * @access Private
 */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterviewReportController);


/**
 * @route GET /api/interview/report/:interviewId
 * @desc Get interview report by interviewId
 * @access Private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getReportByIdController);

/**
 * @route GET /api/interview/
 * @desc Get all interview reports of logged in user
 * @access Private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllReportsController); 

module.exports = interviewRouter;