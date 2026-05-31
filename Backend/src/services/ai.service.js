const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

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
  
  const prompt = `Generate an interview preparation report for the following candidate and job.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Derive the job title from the job description.`;

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

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    // Inject CSS to handle multi-page pagination properly
    await page.addStyleTag({
      content: `
        html, body { height: auto !important; overflow: visible !important; }
        section, .section { page-break-inside: avoid; }
        h1, h2, h3 { page-break-after: avoid; }
        ul, ol { page-break-inside: avoid; }
      `,
    });

    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
    });
  } finally {
    await browser.close();
  }
}

async function generateResumePdf({ resume, selfDescription, jobDescription, resumeLinks = [] }) {
  const resumePdfSchema = z.object({
    detectedSections: z.array(z.string()).describe("Array of section headings detected from the original resume, in order"),
    html: z.string().describe("Complete HTML document of the ATS-optimized resume"),
  });

  // Use pre-extracted links from DB, fallback to regex extraction from text
  const extractedLinks = resumeLinks.length > 0
    ? resumeLinks
    : [...new Set((resume.match(/https?:\/\/[^\s,)>]+/gi) || []))];

  const linksSection = extractedLinks.length > 0
    ? `\nEXTRACTED LINKS FROM RESUME (must be preserved as clickable <a> tags in HTML):\n${extractedLinks.map((url) => {
        try {
          const domain = new URL(url).hostname.replace("www.", "");
          return `- ${url} (domain: ${domain})`;
        } catch {
          return `- ${url}`;
        }
      }).join("\n")}\n`
    : "";

  const prompt = `You are an expert ATS Resume Optimizer specializing in maximizing interview call rates.

RESUME (source of truth):
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}
${linksSection}
GOAL:
Rewrite the resume to maximize ATS score and interview callback rate for the target job. Focus on QUALITY over quantity — every bullet point must earn its place.

ATS OPTIMIZATION STRATEGY:
1. Mirror exact keywords and phrases from the Job Description naturally throughout the resume.
2. Front-load each bullet with a strong action verb (Led, Engineered, Optimized, Architected, Delivered, Spearheaded, Reduced, Increased, etc.).
3. Quantify impact wherever possible (%, $, time saved, users served, performance gains). If the original resume has numbers, preserve them. If context supports a reasonable metric, add it.
4. Write concise, high-impact bullets — each one should demonstrate a RESULT, not just a task. Use the formula: Action Verb + What You Did + Measurable Result.
5. Remove filler words and vague language (responsible for, helped with, worked on, assisted in).
6. Tailor the Profile/Summary to directly address the target role — mention the role title, years of experience, and 3-4 core competencies from the JD.
7. Place the most relevant skills first in the Skills section, matching JD terminology exactly.
8. Ensure technical terms match the JD spelling (e.g., "Node.js" not "NodeJS", "Kubernetes" not "K8s" unless JD uses it).

HUMAN TONE (critical):
- Write like a real person, NOT like an AI. Avoid robotic, overly polished, or generic corporate language.
- Vary sentence structure and bullet length — not every bullet should follow the same formula rigidly.
- Use natural, conversational professional language. A real human wouldn't write "Spearheaded the orchestration of cross-functional synergies" — they'd write "Led a 4-person team to ship the payment integration 2 weeks early."
- Avoid buzzwords that scream AI: "leveraged", "utilized", "synergies", "cutting-edge", "innovative solutions", "drove transformational outcomes".
- Keep the candidate's original voice and tone where possible. If they wrote casually, stay professional but not stiff.
- Each bullet should sound like something the candidate would confidently say in an interview.
- Imperfection is human — not every bullet needs to be a masterpiece. Prioritize authenticity over perfection.

STRUCTURE RULES (non-negotiable):
1. Preserve every section heading exactly as in the original.
2. Preserve section order exactly.
3. Preserve all company names, job titles, project names, dates, education, certifications, and contact info exactly.
4. Do NOT add, remove, merge, or split sections.
5. Do NOT invent experience, projects, achievements, or technologies not supported by the resume or self description.
6. All URLs from the resume MUST appear as clickable <a href="..."> links matched to correct context by domain.

QUALITY GUIDELINES:
- Keep bullets to 1-2 lines max. Cut weak bullets rather than keeping filler.
- Prefer 4-6 strong bullets per role over 8-10 weak ones.
- Every bullet should pass the "So what?" test — it must show impact or value.
- Avoid repeating the same action verb in consecutive bullets.
- Use industry-standard terminology from the Job Description.

OUTPUT:
Return ONLY valid JSON with:
- "detectedSections": array of section headings from the original resume, in their original order.
- "html": a complete, clean HTML document (with <html>, <head>, <body>) styled for professional PDF output.

HTML REQUIREMENTS:
- Must start with <html and end with </html>.
- Use clean, readable typography (font-size: 11-12pt, line-height: 1.4-1.5).
- Do NOT constrain height to one page. Let content flow naturally across pages.
- Do NOT use fixed height, max-height, or overflow:hidden.
- Use simple CSS that ATS parsers handle well (no complex grids or columns).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseFormat: {
        text: {
          mimeType: "application/json",
          schema: zodToJsonSchema(resumePdfSchema),
        },
      },
    },
  });

  const rawText = response.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const jsonContent = resumePdfSchema.parse(JSON.parse(rawText));

  // --- Section Validation ---
  // Extract section headings from original resume (lines that are all uppercase letters/spaces/common punctuation)
  const originalSections = resume
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && line.length > 2 && line.length < 50 && /^[A-Z][A-Z\s&\-\/()]+$/.test(line));

  const generatedSections = jsonContent.detectedSections;

  // Validate: same sections in same order
  if (JSON.stringify(originalSections) !== JSON.stringify(generatedSections)) {
    throw new Error(
      `Resume structure validation failed. ` +
      `Expected sections: ${JSON.stringify(originalSections)} | ` +
      `Received sections: ${JSON.stringify(generatedSections)}`
    );
  }

  // --- HTML Validation ---
  if (!jsonContent.html.includes("<html") || !jsonContent.html.includes("</html>")) {
    throw new Error("Invalid HTML: missing <html> or </html> tags");
  }

  // --- Link Re-injection ---
  // Ensure all extracted URLs are present as clickable links in the HTML
  let html = jsonContent.html;
  for (const url of extractedLinks) {
    if (!html.includes(url)) {
      // URL is missing from HTML — inject it based on domain context
      try {
        const domain = new URL(url).hostname.replace("www.", "");
        const domainLabel = domain.split(".")[0]; // e.g., "linkedin", "github"
        // Find a text mention of the domain and wrap it with a link
        const domainRegex = new RegExp(`(?<!href="[^"]*?)(?<!<a[^>]*?>)\\b(${domainLabel}[^<]*)`, "i");
        const match = html.match(domainRegex);
        if (match) {
          html = html.replace(match[0], `<a href="${url}">${match[0]}</a>`);
        } else {
          // Append link in the contact/header area (before first section)
          const bodyMatch = html.match(/(<body[^>]*>)/i);
          if (bodyMatch) {
            html = html.replace(bodyMatch[0], `${bodyMatch[0]}\n<a href="${url}">${url}</a><br/>`);
          }
        }
      } catch {
        // Invalid URL, skip
      }
    }
  }

  return { html, pdfBuffer: await generatePdfFromHtml(html) };
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
  generatePdfFromHtml,
};