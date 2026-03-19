import { normalize, getSynonyms } from './keywordExtractor';

const safeInsertTech = (line, keyword) => {
    let result = line;
    let replaced = false;

    // Remove trailing period temporarily
    const hasPeriod = result.trim().endsWith('.');
    if (hasPeriod) result = result.trim().slice(0, -1);

    // Natural insertion patterns (leveraging, built with, using, powered by)
    const patterns = [
        { regex: /\b(backend services|backend systems)\b(?! using \*\*| built with \*\*| leveraging \*\*| powered by \*\*)/i, replacement: `$1 leveraging **${keyword}**` },
        { regex: /\b(frontend application|web application|ui)\b(?! using \*\*| built with \*\*| leveraging \*\*| powered by \*\*)/i, replacement: `$1 built with **${keyword}**` },
        { regex: /\b(architecture|microservices)\b(?! using \*\*| built with \*\*| leveraging \*\*| powered by \*\*)/i, replacement: `$1 powered by **${keyword}**` },
        { regex: /\b(data pipelines|pipelines|models|processing)\b(?! using \*\*| built with \*\*| leveraging \*\*| powered by \*\*)/i, replacement: `$1 using **${keyword}**` },
        { regex: /\b(application|platform|system)\b(?! using \*\*| built with \*\*| leveraging \*\*| powered by \*\*)/i, replacement: `$1 built with **${keyword}**` }
    ];

    for (const p of patterns) {
        if (!replaced && p.regex.test(result)) {
            result = result.replace(p.regex, p.replacement);
            replaced = true;
        }
    }

    // Default fallback: If no pattern matched, we don't force it awkwardly.
    // We let the engine skip insertion and attempt weak-verb upgrades instead.
    if (!replaced) {
        return hasPeriod ? `${result}.` : result;
    }

    return hasPeriod ? `${result}.` : result;
};

const upgradeWeakVerbs = (line) => {
    const weakVerbs = [
        { regex: /^(worked on)\b/i, replacement: 'Developed' },
        { regex: /^(helped with)\b/i, replacement: 'Contributed to the development of' },
        { regex: /^(assisted in)\b/i, replacement: 'Engineered' } // Upgrading as per prompt
    ];

    let improved = line;
    for (const weak of weakVerbs) {
        if (weak.regex.test(improved)) {
            improved = improved.replace(weak.regex, weak.replacement);
            break;
        }
    }
    return improved;
};

export const suggestImprovements = (line, resumeSkills, analysis) => {
    if (!line || !resumeSkills.length || !analysis) return line;

    let improved = line;

    // Apply synonym alignment: Replace synonyms in the resume with JD exact terminology
    if (analysis.matches) {
        analysis.matches.forEach(matchNorm => {
            const jdRaw = analysis.jdRawMapping[matchNorm];
            if (!jdRaw) return;
            
            // Replaces instances of synonyms (e.g. "NodeJS") with JD terminology (e.g. "Node.js")
            const synonyms = getSynonyms(matchNorm).filter(s => s.toLowerCase() !== jdRaw.toLowerCase());
            synonyms.forEach(syn => {
                if (syn.length < 2) return; // Ignore very short mappings
                const regex = new RegExp(`\\b${syn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                if (regex.test(improved)) {
                    improved = improved.replace(regex, jdRaw);
                }
            });
        });
    }

    // Rule 1 & 2: We ONLY suggest using MISSING JD keywords.
    // However, we MUST NOT fabricate specific tools.
    // We categorize missing keywords into "Safe Concepts" (e.g., microservices, REST API, CI/CD, Agile)
    // vs "Specific Tools" (e.g., Python, AWS, Docker).

    const safeConcepts = [
        'microservices', 'microservice', 'rest api', 'restful api', 'rest',
        'domain driven design', 'ddd', 'ci/cd', 'unit testing', 'integration testing',
        'agile', 'scrum', 'backend', 'frontend', 'architecture', 'pipelines'
    ];

    const missingKeywords = analysis.missing.map(k => k.toLowerCase());

    // We can only suggest a missing keyword if it's a "Safe Concept".
    // If it's a specific tool (like "Go" or "Postgres"), we CANNOT suggest it unless it's already in the resume (which means it wouldn't be missing).

    const candidateKeywords = missingKeywords.filter(k => safeConcepts.includes(k));

    // Weak Verb Upgrade Strategy if no viable candidate keywords
    if (candidateKeywords.length === 0) {
        return upgradeWeakVerbs(line);
    }

    // Count existing technical keywords in the bullet to ensure we don't stuff it
    let existingTechCount = 0;
    const lowerLine = line.toLowerCase();

    // Only count from the resume's own skills
    resumeSkills.forEach(skill => {
        const skillRegex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'i');
        if (skillRegex.test(lowerLine)) {
            existingTechCount++;
        }
    });

    // Rule 7 & 9: If bullet already contains 2 or more technical keywords, DO NOT modify it further
    if (existingTechCount >= 2) return improved;

    let keywordInserted = false;

    // Try to insert exactly ONE missing "Safe Concept" keyword
    for (const keyword of candidateKeywords) {
        // Rule 8: If bullet already contains the keyword (edge case), skip it
        const existsRegex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
        if (existsRegex.test(improved.toLowerCase())) continue;

        // Ensure we only insert if there is contextual relevance. 
        // e.g., only add "microservices" if the bullet mentions "backend" or "services" or "api".
        // safeInsertTech handles this via its targeted regex patterns.
        const newBuf = safeInsertTech(improved, keyword);
        if (newBuf !== improved) {
            improved = newBuf;
            keywordInserted = true;
            break; // Rule 5: NEVER insert more than 1 technical keyword
        }
    }

    // If no keyword was inserted safely, try weak verb improvement
    if (!keywordInserted) {
        const verbUpgraded = upgradeWeakVerbs(improved);
        if (verbUpgraded !== improved) {
            improved = verbUpgraded;
        }
    }

    return improved;
};

export const generateSuggestions = (experience, projects, skills, summary, analysis) => {
    const allSuggestions = [];
    if (!analysis || analysis.score < 60 || analysis.missing.length === 0) return [];

    const flatSkills = Object.values(skills).flat();

    // Process Summary
    if (summary) {
        const lines = summary.split('\n');
        lines.forEach((line, index) => {
            const improved = suggestImprovements(line, flatSkills, analysis);
            if (improved !== line && improved.trim() !== '') {
                allSuggestions.push({
                    type: 'profileSummary',
                    itemId: 'summary',
                    lineIndex: index,
                    original: line,
                    suggested: improved
                });
            }
        });

        // Summary emphasis
        const lowerSummary = summary.toLowerCase();
        const absentMatches = analysis.matches.filter(m => !lowerSummary.includes(m.toLowerCase()));
        if (absentMatches.length > 0) {
            const topSkills = absentMatches.slice(0, 2).map(m => analysis.jdRawMapping[m] || m);
            if (topSkills.length > 0) {
                const emphasisSentence = `Experienced in delivering solutions utilizing ${topSkills.join(' and ')}.`;
                if (!lowerSummary.includes('delivering solutions utilizing')) {
                    allSuggestions.push({
                        type: 'profileSummaryAppend',
                        itemId: 'summary',
                        original: 'Append emphasis to summary based on matched skills not currently highlighted in the summary.',
                        suggested: emphasisSentence
                    });
                }
            }
        }
    }

    // Process Experience
    experience.forEach(job => {
        const lines = (job.description || '').split('\n');
        lines.forEach((line, index) => {
            const improved = suggestImprovements(line, flatSkills, analysis);
            if (improved !== line && improved.trim() !== '') {
                allSuggestions.push({
                    type: 'experience',
                    itemId: job.id,
                    lineIndex: index,
                    original: line,
                    suggested: improved
                });
            }
        });

        // Controlled Bullet Addition (newBullet)
        const lowerDesc = (job.description || '').toLowerCase();
        let addedBullet = false;

        if (lowerDesc.includes('api') && lowerDesc.includes('data')) {
            const matchingSkillsHere = flatSkills.filter(s => lowerDesc.includes(s.toLowerCase()));
            if (matchingSkillsHere.length > 0) {
                const tech = analysis.jdRawMapping[normalize(matchingSkillsHere[0])] || matchingSkillsHere[0];
                const suggestedBullet = `Engineered data and API integrations utilizing ${tech}.`;
                if (!lowerDesc.includes('data and api integrations')) {
                    allSuggestions.push({
                        type: 'experienceNewBullet',
                        itemId: job.id,
                        original: 'Suggest summarizing bullet based on mentioned API & Data work in this role.',
                        suggested: suggestedBullet
                    });
                    addedBullet = true;
                }
            }
        }

        if (!addedBullet && lowerDesc.includes('microservice') && lowerDesc.includes('backend')) {
            const suggestedBullet = `Developed backend services within a microservices architecture.`;
            if (!lowerDesc.includes('services within a microservices')) {
                allSuggestions.push({
                    type: 'experienceNewBullet',
                    itemId: job.id,
                    original: 'Suggest summarizing bullet based on mentioned backend microservices work.',
                    suggested: suggestedBullet
                });
            }
        }
    });

    // Process Projects
    projects.forEach(proj => {
        const lines = (proj.description || '').split('\n');
        lines.forEach((line, index) => {
            const improved = suggestImprovements(line, flatSkills, analysis);
            if (improved !== line && improved.trim() !== '') {
                allSuggestions.push({
                    type: 'projects',
                    itemId: proj.id,
                    lineIndex: index,
                    original: line,
                    suggested: improved
                });
            }
        });
    });

    // Skill Terminology Alignment (skillRename)
    Object.entries(skills).forEach(([category, catSkills]) => {
        catSkills.forEach((skill, index) => {
            const normSkill = normalize(skill);
            if (analysis.matches.includes(normSkill)) {
                const jdRaw = analysis.jdRawMapping[normSkill];
                if (jdRaw && jdRaw !== skill) {
                    allSuggestions.push({
                        type: 'skillRename',
                        itemId: category,
                        lineIndex: index,
                        original: skill,
                        suggested: jdRaw
                    });
                }
            }
        });
    });

    return allSuggestions;
};
