const express = require('express');
const router = express.Router();

// Fetch GitHub user profile + repos (no auth needed for public data)
router.get('/profile/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // Fetch profile
        const profileRes = await fetch(`https://api.github.com/users/${username}`, {
            headers: { 'User-Agent': 'Astra-Career-Platform' }
        });

        if (!profileRes.ok) {
            return res.status(404).json({ error: `GitHub user "${username}" not found.` });
        }

        const profile = await profileRes.json();

        // Fetch repos (sorted by stars)
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=30&direction=desc`, {
            headers: { 'User-Agent': 'Astra-Career-Platform' }
        });

        const repos = await reposRes.json();

        // Extract languages from all repos
        const languageSet = new Set();
        const projects = [];

        for (const repo of repos) {
            if (repo.fork) continue; // skip forks

            if (repo.language) languageSet.add(repo.language);

            // Fetch repo languages breakdown
            let techStack = [repo.language].filter(Boolean);
            try {
                const langRes = await fetch(repo.languages_url, {
                    headers: { 'User-Agent': 'Astra-Career-Platform' }
                });
                const langData = await langRes.json();
                techStack = Object.keys(langData);
                techStack.forEach(l => languageSet.add(l));
            } catch (e) { /* ignore */ }

            projects.push({
                name: repo.name,
                description: repo.description || '',
                techStack: techStack.join(', '),
                liveUrl: repo.homepage || '',
                repoUrl: repo.html_url,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                lastUpdated: repo.updated_at
            });
        }

        // Build structured response
        const result = {
            personalInfo: {
                fullName: profile.name || username,
                jobTitle: profile.bio || '',
                email: profile.email || '',
                location: profile.location || '',
                github: `https://github.com/${username}`,
                portfolio: profile.blog || '',
                avatar: profile.avatar_url
            },
            technicalSkills: Array.from(languageSet),
            projects: projects.slice(0, 10), // top 10
            stats: {
                publicRepos: profile.public_repos,
                followers: profile.followers,
                following: profile.following,
                totalStars: projects.reduce((sum, p) => sum + p.stars, 0),
                topLanguages: Array.from(languageSet).slice(0, 8)
            }
        };

        console.log(`[GitHub Sync] Fetched ${projects.length} repos for @${username}`);
        res.json(result);

    } catch (error) {
        console.error('[GitHub Sync] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch GitHub data.', details: error.message });
    }
});

module.exports = router;
