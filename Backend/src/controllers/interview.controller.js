const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf, generatePdfFromHtml } = require("../services/ai.service");
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
    let resumeLinks = [];
    if (resumeFile) {
        const resumeContent = await (new pdfParse.PDFParse(new Uint8Array(resumeFile.buffer))).getText();
        resumeText = resumeContent.text;
        // Extract URLs from visible text
        const textUrls = resumeText.match(/https?:\/\/[^\s,)>]+/gi) || [];
        // Also scan raw PDF buffer for hyperlink annotations stored as plaintext URI strings
        const rawPdfString = resumeFile.buffer.toString("latin1");
        const bufferUrls = rawPdfString.match(/https?:\/\/[^\s,)>\]"']+/gi) || [];
        resumeLinks = [...new Set([...textUrls, ...bufferUrls])];
    }

    const interviewReportByAi = await generateInterviewReport({ resume: resumeText, selfDescription, jobDescription });

    const interviewReport = await InterviewReportModel.create({
        user: req.user.id,
        resumeText,
        resumeLinks,
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
    const report = await InterviewReportModel.findById(interviewId).select("-resumeText -resumeLinks -generatedResumeHtml -__v");
    if (!report) {
        return res.status(404).json({ message: "Interview report not found" });
    }
    res.status(200).json({
        message: "Interview report fetched successfully",
        interviewReport: report
    });
}


/**
 * @description Controller to generate resume PDF based on the interview report 
 */

async function generateResumePdfController(req, res) {
    const { interviewId } = req.params;
    const report = await InterviewReportModel.findById(interviewId);
    if (!report) {
        return res.status(404).json({ message: "Interview report not found" });
    }

    let resumePdfBuffer;

    if (report.generatedResumeHtml) {
        // Use cached HTML — skip Gemini API call
        resumePdfBuffer = await generatePdfFromHtml(report.generatedResumeHtml);
    } else {
        // First time — generate via Gemini and cache the HTML
        const { resumeText, jobDescription, selfDescription, resumeLinks } = report;
        const { html, pdfBuffer } = await generateResumePdf({ resume: resumeText, jobDescription, selfDescription, resumeLinks: resumeLinks || [] });
        resumePdfBuffer = pdfBuffer;
        await InterviewReportModel.findByIdAndUpdate(interviewId, { generatedResumeHtml: html });
    }

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${report._id}.pdf`,
    }); 
    res.send(resumePdfBuffer);
}

module.exports = { generateInterviewReportController, getAllReportsController, getReportByIdController, generateResumePdfController }