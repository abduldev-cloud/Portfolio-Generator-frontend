const express = require('express');
const router = express.Router();

router.post('/check', (req, res) => {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
        return res.status(400).json({ error: 'Resume text and job description are required' });
    }

    const resumeLower = resumeText.toLowerCase();
    const jdLower = jobDescription.toLowerCase();

    // 1. Keyword Matching (Simplified)
    const commonWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'in', 'of', 'for', 'with', 'by', 'as'];
    const jdKeywords = jdLower.split(/\W+/).filter(word => word.length > 3 && !commonWords.includes(word));
    const uniqueKeywords = [...new Set(jdKeywords)];

    let matches = 0;
    const matchedKeywords = [];
    uniqueKeywords.forEach(keyword => {
        if (resumeLower.includes(keyword)) {
            matches++;
            matchedKeywords.push(keyword);
        }
    });

    const keywordScore = uniqueKeywords.length > 0 ? (matches / uniqueKeywords.length) * 60 : 60;

    // 2. Section Analysis
    const sections = ['experience', 'education', 'skills', 'projects', 'contact'];
    let sectionScore = 0;
    const foundSections = [];
    sections.forEach(section => {
        if (resumeLower.includes(section)) {
            sectionScore += (40 / sections.length);
            foundSections.push(section);
        }
    });

    const totalScore = Math.min(100, Math.round(keywordScore + sectionScore));

    const missingSections = sections.filter(s => !foundSections.includes(s));
    const missingKeywords = uniqueKeywords.filter(k => !matchedKeywords.includes(k)).slice(0, 10);

    res.json({
        score: totalScore,
        breakdown: {
            keywordMatch: Math.round(keywordScore),
            sectionMatch: Math.round(sectionScore)
        },
        recommendations: {
            foundSections,
            missingSections,
            suggestedKeywords: missingKeywords
        }
    });
});

module.exports = router;
