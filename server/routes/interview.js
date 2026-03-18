const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const INTERVIEW_PROMPT = `
You are an AI Interview Coach for the Astra career platform.

Based on the Resume and Job Description provided, generate a comprehensive interview preparation guide.

You must return ONLY valid JSON with this exact structure:

{
  "role_summary": "Brief summary of the target role",
  "technical_questions": [
    {
      "question": "The interview question",
      "difficulty": "Easy|Medium|Hard",
      "category": "category name",
      "why_asked": "Why the interviewer asks this",
      "star_answer": {
        "situation": "Example situation to describe",
        "task": "What needed to be done",
        "action": "What actions to take",
        "result": "What measurable result to highlight"
      },
      "key_points": ["point 1", "point 2"]
    }
  ],
  "behavioral_questions": [
    {
      "question": "The behavioral question",
      "category": "Leadership|Teamwork|Problem-Solving|Communication|Adaptability",
      "why_asked": "Why this is asked",
      "star_answer": {
        "situation": "",
        "task": "",
        "action": "",
        "result": ""
      },
      "tips": ["tip 1", "tip 2"]
    }
  ],
  "preparation_tips": ["tip 1", "tip 2", "tip 3"],
  "red_flags_to_avoid": ["flag 1", "flag 2"],
  "salary_negotiation": {
    "estimated_range": "salary range string",
    "negotiation_tips": ["tip 1", "tip 2"]
  }
}

Generate exactly 5 technical questions and 5 behavioral questions.
Tailor everything specifically to the resume and job description provided.
Do not include any text outside the JSON.
`;

router.post('/generate', async (req, res) => {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
        return res.status(400).json({ error: 'Resume and job description are required.' });
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
            console.log(`[Interview Coach] Attempting model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const userInput = `
Resume:
${resumeText}

Job Description:
${jobDescription}

Generate the interview preparation guide now.
`;

            const result = await model.generateContent([
                { text: INTERVIEW_PROMPT },
                { text: userInput }
            ]);

            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
            const data = JSON.parse(jsonStr);

            console.log(`[Interview Coach] Success with ${modelName}`);
            return res.json(data);

        } catch (error) {
            console.error(`[Interview Coach] Failed with ${modelName}:`, error.message);
            lastError = error;
            if (error.status === 404 || error.message.includes("404")) continue;
            else break;
        }
    }

    res.status(500).json({
        error: 'Interview generation failed.',
        details: lastError?.message || 'Unknown error'
    });
});

module.exports = router;
