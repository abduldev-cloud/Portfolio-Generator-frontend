const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const AGENT_PROMPT = `
You are the Career Optimization AI Agent for the Astra platform.

Your objective is to help the user improve their resume and portfolio to match a specific job role.

You must behave like an autonomous agent that can plan tasks and choose tools.

---

GOAL

Optimize the user's resume and career profile to match the target job description.

---

AVAILABLE TOOLS

1. resume_parser
   Extract structured information from resume text.
   Returns: candidate_name, professional_title, years_of_experience, technical_skills[], soft_skills[], tools_and_frameworks[], education[], certifications[], projects[], work_experience[]

2. job_analyzer
   Analyze job description and extract required skills and expectations.
   Returns: role_title, required_skills[], preferred_skills[], experience_level, key_responsibilities[], technologies_required[], hidden_expectations[]

3. skill_matcher
   Compare resume skills with job requirements.
   Returns: overall_score (0-100), skill_match_percentage (0-100), domain_fit_score (0-100), experience_alignment (0-100), matched_skills[], partially_matched_skills[], missing_skills[], hiring_probability_band (Low|Moderate|Strong|Very Strong)

4. resume_rewriter
   Rewrite resume to be ATS optimized.
   Returns: The full optimized resume as formatted text string.

5. portfolio_advisor
   Suggest portfolio improvements.
   Returns: improved_headline, positioning_statement, recommended_job_titles[], portfolio_project_ideas[], linkedin_improvements[], career_growth_suggestions[]

---

AGENT RULES

- Understand the goal.
- Create a plan using the available tools.
- Execute tools in logical order.
- Use results from previous tools to guide next steps.
- Continue until the resume is fully optimized.

---

OUTPUT FORMAT

Return ONLY valid JSON with this exact structure:

{
  "plan": ["step 1 description", "step 2 description", ...],
  "steps_executed": [
    {
      "tool": "resume_parser",
      "status": "completed",
      "result": { ... }
    },
    {
      "tool": "job_analyzer",
      "status": "completed",
      "result": { ... }
    },
    {
      "tool": "skill_matcher",
      "status": "completed",
      "result": { ... }
    },
    {
      "tool": "resume_rewriter",
      "status": "completed",
      "result": "optimized resume text..."
    },
    {
      "tool": "portfolio_advisor",
      "status": "completed",
      "result": { ... }
    }
  ],
  "final_analysis": {
    "executive_summary": "string",
    "overall_score": 0,
    "hiring_probability_band": "Strong",
    "critical_gaps": [],
    "key_strengths": []
  },
  "optimized_resume": "full ATS-optimized resume text",
  "career_strategy": {
    "improved_headline": "string",
    "positioning_statement": "string",
    "recommended_roles": [],
    "portfolio_ideas": [],
    "growth_suggestions": []
  }
}

Do not include any text outside the JSON.
Ensure every tool is executed and its result is included.
`;

router.post('/parse-resume', upload.single('resume'), async (req, res) => {
    try {
        console.log(`[Astra Server] Incoming parse request. File: ${req.file?.originalname}, Size: ${req.file?.size}, Type: ${req.file?.mimetype}`);

        if (!req.file) {
            console.error('[Astra Server] No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let resumeText = '';
        const fileBuffer = req.file.buffer;
        const fileType = req.file.mimetype;

        if (fileType === 'application/pdf') {
            console.log('[Astra Server] Parsing PDF...');
            const data = await pdfParse(fileBuffer);
            resumeText = data.text;
        } else if (
            fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            fileType === 'application/msword' ||
            req.file.originalname.endsWith('.docx') ||
            req.file.originalname.endsWith('.doc')
        ) {
            console.log('[Astra Server] Parsing Word document...');
            const data = await mammoth.extractRawText({ buffer: fileBuffer });
            resumeText = data.value;
        } else {
            console.warn(`[Astra Server] Unknown file type: ${fileType}. Attempting text conversion.`);
            resumeText = fileBuffer.toString('utf-8');
        }

        if (!resumeText || resumeText.trim().length === 0) {
            throw new Error('Retrieved text is empty. The file might be an image-only PDF or scanned document.');
        }

        console.log(`[Astra Server] Success. Parsed ${resumeText.length} characters.`);
        res.json({ text: resumeText.trim() });
    } catch (error) {
        console.error('[Astra Server] Error parsing resume:', error.message);
        res.status(500).json({ 
            error: 'Failed to extract text from file.',
            details: error.message 
        });
    }
});

router.post('/check', async (req, res) => {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
        return res.status(400).json({ error: 'Resume text and job description are required' });
    }

    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash-lite"
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`[Astra Agent] Attempting model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const userInput = `
INPUT

Resume:
${resumeText}

Job Description:
${jobDescription}

First create a plan, then execute the steps logically and return the results.
`;

            const result = await model.generateContent([
                { text: AGENT_PROMPT },
                { text: userInput }
            ]);

            const response = await result.response;
            const text = response.text();

            const jsonStr = text
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/g, '')
                .trim();

            const analysis = JSON.parse(jsonStr);

            // Validate the agent completed its plan
            if (!analysis.plan || !analysis.steps_executed || !analysis.final_analysis) {
                throw new Error('Agent returned incomplete execution plan');
            }

            console.log(`[Astra Agent] Success — ${analysis.steps_executed.length} tools executed via ${modelName}`);
            return res.json(analysis);

        } catch (error) {
            console.error(`[Astra Agent] Failed with ${modelName}:`, error.message);
            lastError = error;
            if (error.status === 404 || error.message.includes("404") || error.message.includes("not found")) {
                continue;
            } else {
                break;
            }
        }
    }

    res.status(500).json({
        error: 'Astra Agent execution failed.',
        details: lastError ? lastError.message : 'Unknown error',
        tip: 'Verify your GEMINI_API_KEY and ensure internet connectivity.'
    });
});

module.exports = router;
