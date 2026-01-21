const express = require('express');
const router = express.Router();
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

router.post('/generate', async (req, res) => {
    const { userData, templateName } = req.body;
    const templateDir = path.join(__dirname, '../templates', templateName || 'default');

    if (!fs.existsSync(templateDir)) {
        return res.status(404).json({ error: 'Template not found' });
    }

    res.attachment('portfolio.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
        res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    // Function to replace placeholders in a file
    const processFile = (filePath, data) => {
        let content = fs.readFileSync(filePath, 'utf8');
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, data[key]);
        });
        return content;
    };

    // Add files to archive
    const files = fs.readdirSync(templateDir);
    for (const file of files) {
        const filePath = path.join(templateDir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            // For directories (like 'js'), add them recursively or handle simple ones
            const subFiles = fs.readdirSync(filePath);
            for (const subFile of subFiles) {
                archive.append(fs.createReadStream(path.join(filePath, subFile)), { name: `${file}/${subFile}` });
            }
        } else if (file === 'index.html') {
            const processedContent = processFile(filePath, userData);
            archive.append(processedContent, { name: file });
        } else {
            archive.append(fs.createReadStream(filePath), { name: file });
        }
    }

    archive.finalize();
});

module.exports = router;
