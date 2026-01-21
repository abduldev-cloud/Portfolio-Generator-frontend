const express = require('express');
const router = express.Router();
const db = require('../config/db');
const html_to_pdf = require('html-pdf-node');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');

// Save or Update Resume
router.post('/save', async (req, res) => {
    const { userId, resumeContent } = req.body;
    try {
        const [existing] = await db.execute('SELECT id FROM resumes WHERE user_id = ?', [userId]);
        if (existing.length > 0) {
            await db.execute('UPDATE resumes SET content = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ?', [JSON.stringify(resumeContent), userId]);
            res.json({ message: 'Resume updated successfully' });
        } else {
            await db.execute('INSERT INTO resumes (user_id, content) VALUES (?, ?)', [userId, JSON.stringify(resumeContent)]);
            res.status(201).json({ message: 'Resume created successfully' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Resume
router.get('/:userId', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT content FROM resumes WHERE user_id = ?', [req.params.userId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Resume not found' });
        res.json(rows[0].content);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Helper: Generate HTML for Resume
const generateResumeHTML = (content, template = 'classic') => {
    const { personalInfo, experience, skills } = content;
    return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 40px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #000; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ddd; margin-bottom: 10px; color: #444; }
          .exp-item { margin-bottom: 10px; }
          .exp-role { font-weight: bold; }
          .skills { display: flex; flex-wrap: wrap; gap: 10px; }
          .skill-tag { background: #f4f4f4; padding: 2px 8px; border-radius: 4px; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${personalInfo.name}</h1>
          <p>${personalInfo.email}</p>
        </div>
        <div class="section">
          <div class="section-title">Experience</div>
          ${experience.map(exp => `
            <div class="exp-item">
              <div class="exp-role">${exp.role} at ${exp.company}</div>
              <div>${exp.desc}</div>
            </div>
          `).join('')}
        </div>
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills">
            ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
      </body>
    </html>
  `;
};

// Export to PDF
router.post('/export/pdf', async (req, res) => {
    const { resumeContent, template } = req.body;
    const html = generateResumeHTML(resumeContent, template);
    const options = { format: 'A4' };
    const file = { content: html };

    html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
        res.send(pdfBuffer);
    }).catch(err => res.status(500).json({ error: err.message }));
});

// Export to Word (DOCX)
router.post('/export/word', async (req, res) => {
    const { resumeContent } = req.body;
    const { personalInfo, experience, skills } = resumeContent;

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({ text: personalInfo.name, heading: HeadingLevel.HEADING_1, alignment: 'center' }),
                new Paragraph({ text: personalInfo.email, alignment: 'center' }),
                new Paragraph({ text: "" }), // Spacing
                new Paragraph({ text: "EXPERIENCE", heading: HeadingLevel.HEADING_2 }),
                ...experience.flatMap(exp => [
                    new Paragraph({ children: [new TextRun({ text: `${exp.role} at ${exp.company}`, bold: true })] }),
                    new Paragraph({ text: exp.desc }),
                    new Paragraph({ text: "" })
                ]),
                new Paragraph({ text: "SKILLS", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: skills.join(', ') })
            ],
        }],
    });

    Packer.toBuffer(doc).then((buffer) => {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=resume.docx');
        res.send(buffer);
    }).catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
