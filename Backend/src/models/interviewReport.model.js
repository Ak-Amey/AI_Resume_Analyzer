const mongoose = require("mongoose");

/**
 * - job description schema : String
 * - resume text : String
 * - Self description : String
 * - Score : Number
 * 
 * - Technical questions : 
 *     [{
 *       question: String,
 *      answer: String
 *      intention: String
 *     }]
 * - Behavioral questions :
 *    [{
 *      question: String,
 *     answer: String
 *     intention: String
 *   }]
 * - Skill gaps: 
 *   [{
 *     skill: String,
 *     severity: String,
 *     type: String,
 *     enum : ["low","medium","high"]
 *   }]
 * -preparation plan:
 *   [{
 *     day: Number,
 *     focus: String,
 *     tasks: [String]
 *   }]
 *
 */

const technicalQuestionSchema = new mongoose.Schema({
    question:{
        type: String,
        required: [true, "Technical question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
},
{
    _id: false
})

const behavioralQuestionSchema = new mongoose.Schema({
    question:{
        type: String,
        required: [true, "Behavioral question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
},
{
    _id: false
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is required"]
    },
    severity: {
        type: String,
        required: [true, "Severity is required"],
        enum: ["low", "medium", "high"]
    }
},
{
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"]
    },
    focus: {
        type: String,
        required: [true, "Focus is required"]
    },
    tasks: [{
        type: String,
        required: [true, "At least one task is required"]
    }]
},
{
    _id: false
})

const interviewReportSchema = new mongoose.Schema({
    jobDescription: { 
        type: String, required: true 
    },
    resumeText: { 
        type: String
    },
    selfDescription: {
        type: String
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    title:{
        type: String,
        required: [true, "Title is required"]
    }
}, {
    timestamps: true
})

const InterviewReport = mongoose.model("InterviewReport", interviewReportSchema);
module.exports = InterviewReport;

