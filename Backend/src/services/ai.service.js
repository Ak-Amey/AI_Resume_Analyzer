const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "The match score between the candidate and the job describe, which is a number between 0 and 100, where 0 means no match at all and 100 means a perfect match",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take, etc.",
          ),
      }),
    )
    .describe("Technical questions that can be asked in the interview"),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The behavioral question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take, etc.",
          ),
      }),
    )
    .describe("Behavioral questions that can be asked in the interview"),
  skillGaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe(
            "The skill which the candidate is lacking based on the resume, self describe and job describe",
          ),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("The severity of the skill gap"),
      }),
    )
    .describe("The skill gaps that the candidate has"),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .coerce.number()
          .describe("The day number in the preparation plan, starting from 1"),
        focus: z
          .string()
          .describe("The main focus for that day in the preparation plan"),
        tasks: z.array(z.string()).describe("The tasks to be done on that day"),
      }),
    )
    .describe("The preparation plan for the candidate"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  
  const prompt = `
Generate interview report.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return ONLY VALID JSON.

Required structure:

{
matchScore:number,

title: string (the job title derived from the job description),

technicalQuestions:[
{
question,
intention,
answer
}
],

behavioralQuestions:[
{
question,
intention,
answer
}
],

skillGaps:[
{
skill,
severity:
low|medium|high
}
],

preparationPlan:[
{
day,
focus,
tasks:[]
}
]
}

`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseFormat: {
        text: {
          mimeType: "application/json",
          schema: zodToJsonSchema(interviewReportSchema),
        },
      },
    },
  });

  console.log("RAW GEMINI RESPONSE:\n", response.text);

  const report = interviewReportSchema.parse(JSON.parse(response.text));
  console.log(report);

    return report;
}

module.exports = generateInterviewReport;