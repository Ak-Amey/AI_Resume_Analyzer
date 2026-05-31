const pdfParse = require("pdf-parse");
const generateInterviewReport = require("../services/ai.service");
const InterviewReportModel = require("../models/interviewReport.model");


/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */

async function generateInterviewReportController(req, res) {
    const resumeFile = req.file;
    const { selfDescription, jobDescription } = req.body;

    if (!resumeFile && !selfDescription) {
        return res.status(400).json({ message: "Either a resume file or a self description is required" });
    }

    let resumeText = null;
    if (resumeFile) {
        const resumeContent = await (new pdfParse.PDFParse(new Uint8Array(resumeFile.buffer))).getText();
        resumeText = resumeContent.text;
    }

    const interviewReportByAi = await generateInterviewReport({ resume: resumeText, selfDescription, jobDescription });

    const interviewReport = await InterviewReportModel.create({
        user: req.user.id,
        resumeText,
        selfDescription,
        jobDescription,
        ...interviewReportByAi
    })

    res.status(200).json({
        message: "Interview report generated successfully",
        data: interviewReport
    })
}

/**
 * @description Controller to get all interview reports for the logged-in user
 */

async function getAllReportsController(req, res) {
    const reports = await InterviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resumeText -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")
    res.status(200).json({
        message: "Interview reports fetched successfully",
        interviewReports: reports
    })
}


/**
 * @description Controller to get interview report by interviewId
 */

async function getReportByIdController(req, res) {
    const { interviewId } = req.params;
    const report = await InterviewReportModel.findById(interviewId);
    if (!report) {
        return res.status(404).json({ message: "Interview report not found" });
    }
    res.status(200).json({
        message: "Interview report fetched successfully",
        interviewReport: report
    });
}

module.exports = { generateInterviewReportController, getAllReportsController, getReportByIdController }