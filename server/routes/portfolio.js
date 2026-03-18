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

    res.attachment(`${(userData.personalInfo?.fullName || 'Portfolio').replace(/\s+/g, '_')}_Portfolio.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
        res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    // Add files to archive
    const files = fs.readdirSync(templateDir);
    for (const file of files) {
        const filePath = path.join(templateDir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            const addDirToArchive = (dir, currentPathInArchive) => {
                const subItems = fs.readdirSync(dir);
                for (const subItem of subItems) {
                    const subPath = path.join(dir, subItem);
                    const subStats = fs.statSync(subPath);
                    const itemArchiveName = path.join(currentPathInArchive, subItem);
                    if (subStats.isDirectory()) {
                        addDirToArchive(subPath, itemArchiveName);
                    } else {
                        archive.append(fs.createReadStream(subPath), { name: itemArchiveName });
                    }
                }
            };
            addDirToArchive(filePath, file);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // 1. SIMPLE REPLACEMENTS with double-escaped \s
            const pi = userData.personalInfo || {};
            const replacements = {
                name: pi.fullName || 'Professional',
                title: pi.jobTitle || 'Developer',
                summary: pi.summary || 'Aspiring professional with strong skills.',
                email: pi.email || '',
                phone: pi.phone || '',
                location: pi.location || '',
                linkedin: pi.linkedin || '',
                github: pi.github || '',
                portfolio: pi.portfolio || ''
            };

            Object.entries(replacements).forEach(([key, value]) => {
                // IMPORTANT: Use double backslash for \s in RegExp constructor string
                const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
                content = content.replace(regex, value);
            });

            // 2. ARRAY LOOP ENHANCEMENTS
            const processLoop = (source, arrayName, arrayData) => {
                // Regex for {{#each ...}} ... {{/each}}
                const loopRegex = new RegExp(`\\{\\{\\s*#each\\s+${arrayName}\\s*\\}\\}([\\s\\S]*?)\\{\\{\\s*/each\\s*\\}\\}`, 'g');
                
                return source.replace(loopRegex, (match, template) => {
                    if (!arrayData || !Array.isArray(arrayData) || arrayData.length === 0) {
                        return '';
                    }
                    return arrayData.map(item => {
                        let itemHtml = template;
                        if (typeof item === 'object') {
                            Object.entries(item).forEach(([key, value]) => {
                                const fieldRegex = new RegExp(`\\{\\{\\s*item.${key}\\s*\\}\\}`, 'g');
                                itemHtml = itemHtml.replace(fieldRegex, value || '');
                            });
                        } else {
                            const fieldRegex = new RegExp(`\\{\\{\\s*item\\s*\\}\\}`, 'g');
                            itemHtml = itemHtml.replace(fieldRegex, item);
                        }
                        return itemHtml;
                    }).join('');
                });
            };

            content = processLoop(content, 'experience', userData.experience);
            content = processLoop(content, 'projects', userData.projects);
            content = processLoop(content, 'education', userData.education);
            
            const skills = userData.skills || {};
            content = processLoop(content, 'techSkills', (skills.technical || []).map(s => ({ name: s })));
            content = processLoop(content, 'frameworks', (skills.frameworks || []).map(s => ({ name: s })));
            content = processLoop(content, 'tools', (skills.tools || []).map(s => ({ name: s })));

            archive.append(content, { name: file });
        } else {
            archive.append(fs.createReadStream(filePath), { name: file });
        }
    }

    archive.finalize();
});

module.exports = router;
