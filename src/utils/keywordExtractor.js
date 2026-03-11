const CATEGORIES = {
  languages: [
    "java","python","go","golang","ruby","javascript","typescript",
    "kotlin","scala","rust","php","swift","dart"
  ],

  frameworks: [
    "spring","spring boot","spring mvc","spring security",
    "django","flask","rails","ruby on rails",
    "express","nodejs","nestjs","nextjs","react","angular","vue",
    "hibernate","struts","quarkus","micronaut"
  ],

  architecture: [
    "microservices","microservice","monolith","monolithic",
    "distributed systems","event driven architecture",
    "domain driven design","ddd","clean architecture",
    "hexagonal architecture","layered architecture",
    "rest","rest api","restful api","graphql","grpc",
    "api gateway","service mesh"
  ],

  databases: [
    "mysql","postgres","postgresql","mongodb","redis","cassandra",
    "dynamodb","oracle","sql server","sqlite","mariadb",
    "elasticsearch","opensearch"
  ],

  devops: [
    "docker","kubernetes","helm","terraform","ansible",
    "ci/cd","jenkins","gitlab","github actions","circleci",
    "travis","bamboo","git","bitbucket"
  ],

  messaging: [
    "kafka","rabbitmq","activemq","sqs","pubsub",
    "google pubsub","event streaming","message queue"
  ],

  cloud: [
    "aws","amazon web services","gcp","google cloud",
    "azure","ec2","s3","lambda","cloud run",
    "cloud functions","rds","cloudformation"
  ],

  testing: [
    "unit testing","integration testing","test automation",
    "junit","mockito","pytest","selenium","cypress",
    "jest","testng","bdd","tdd"
  ]
};

const STOPWORDS = [
    'the', 'and', 'with', 'for', 'from', 'about', 'role', 'job', 'ensure', 'follow',
    'contribute', 'promote', 'daily', 'operations', 'working', 'development',
    'perform', 'assist', 'company', 'team', 'description', 'mission'
];

const NORMALIZATION_MAP = {
  "rest": "REST API",
  "rest api": "REST API",
  "restful api": "REST API",

  "microservice": "Microservices",
  "microservices": "Microservices",

  "domain driven design": "DDD",
  "ddd": "DDD",

  "golang": "Go",
  "go": "Go",

  "postgres": "PostgreSQL",
  "postgresql": "PostgreSQL",

  "node": "Node.js",
  "nodejs": "Node.js",

  "ci/cd pipeline": "CI/CD",
  "ci cd": "CI/CD",

  "aws cloud": "AWS",
  "amazon web services": "AWS"
};

export const normalize = (word) => {
    const lower = word.toLowerCase().trim();
    return NORMALIZATION_MAP[lower] || word;
};

export const extractKeywords = (text) => {
    if (!text) return [];

    const lowerText = text.toLowerCase();
    const foundNorms = new Set();
    const rawMap = {};

    // Remove company info heuristic: usually at start or end with specific keywords
    let cleanedText = lowerText;
    const companyKeywords = ['about the company', 'who we are', 'our mission', 'company description'];
    companyKeywords.forEach(ck => {
        const idx = cleanedText.indexOf(ck);
        if (idx !== -1) {
            // If it's at the start, remove up to next major section or end
            // If it's at the end, remove from there
            if (idx < cleanedText.length / 2) {
                cleanedText = cleanedText.slice(idx + ck.length);
            } else {
                cleanedText = cleanedText.slice(0, idx);
            }
        }
    });

    Object.values(CATEGORIES).flat().forEach(keyword => {
        // Use word boundaries for matching to avoid partial matches (e.g., 'go' in 'google')
        const regex = new RegExp(`\\b${keyword.replace('.', '\\.')}\\b`, 'i');
        const match = text.match(regex);
        if (match && regex.test(cleanedText)) {
            // Filter out if it's a stopword (though our dictionary shouldn't have them)
            if (!STOPWORDS.includes(keyword)) {
                const norm = normalize(keyword);
                foundNorms.add(norm);
                if (!rawMap[norm]) {
                    rawMap[norm] = match[0]; // Capture the exact case from the original text
                }
            }
        }
    });

    return Array.from(foundNorms).map(norm => ({
        normalized: norm,
        raw: rawMap[norm]
    }));
};

export const compareKeywords = (resume, jdKeywordsInput) => {
    const jdKeywords = jdKeywordsInput.map(k => typeof k === 'string' ? { normalized: k, raw: k } : k);
    if (!jdKeywords.length) return { matches: [], missing: [], score: 0, jdRawMapping: {} };

    const matches = new Set();
    const missing = [];
    let weightedMatchCount = 0;
    let totalJdKeywordsCount = jdKeywords.length;

    const jdRawMapping = {};
    jdKeywords.forEach(k => {
        jdRawMapping[k.normalized] = k.raw;
    });

    const jdNorms = jdKeywords.map(k => k.normalized);

    // Group JD keywords by category to handle OR logic
    const jdByCategory = {};
    Object.entries(CATEGORIES).forEach(([cat, keywords]) => {
        const presentInJD = jdNorms.filter(k => {
            const normK = k.toLowerCase();
            return keywords.some(dictK => normalize(dictK).toLowerCase() === normK);
        });
        if (presentInJD.length > 0) jdByCategory[cat] = presentInJD;
    });

    // Helper to check if a keyword exists in text (with weighting)
    const checkMatch = (keyword, text) => {
        if (!text) return false;
        const normK = keyword.toLowerCase();
        // Check for normalized version or raw version
        return text.toLowerCase().includes(normK) ||
            Object.keys(NORMALIZATION_MAP).some(key =>
                NORMALIZATION_MAP[key].toLowerCase() === normK && text.toLowerCase().includes(key)
            );
    };

    const skillsText = Object.values(resume.skills || {}).flat().join(' ');
    const experienceText = (resume.experience || []).map(e => `${e.title} ${e.company} ${e.description}`).join(' ');
    const projectsText = (resume.projects || []).map(p => `${p.title} ${p.description}`).join(' ');

    jdNorms.forEach(keyword => {
        let matched = false;
        let weight = 0;

        if (checkMatch(keyword, experienceText)) {
            weight = 2.0;
            matched = true;
        } else if (checkMatch(keyword, projectsText)) {
            weight = 1.5;
            matched = true;
        } else if (checkMatch(keyword, skillsText)) {
            weight = 1.0;
            matched = true;
        }

        if (matched) {
            matches.add(keyword);
            weightedMatchCount += weight;
        } else {
            missing.push(keyword);
        }
    });

    // Language OR Rule refinement:
    // If ANY requested language is found, satisfy the whole language group
    const languageKeywords = jdNorms.filter(k => {
        const normK = k.toLowerCase();
        return CATEGORIES.languages.some(lang => normalize(lang).toLowerCase() === normK);
    });

    const hasLanguageMatch = languageKeywords.some(k => matches.has(k));

    if (hasLanguageMatch) {
        languageKeywords.forEach(k => {
            if (!matches.has(k)) {
                matches.add(k);
                const missIdx = missing.indexOf(k);
                if (missIdx !== -1) missing.splice(missIdx, 1);
                // For the score calculation, we treat them as matched
                // We'll add 1.0 weight (Skills equivalent) for these "implied" matches
                weightedMatchCount += 1.0;
            }
        });
    }

    const score = Math.round((matches.size / totalJdKeywordsCount) * 100);

    return {
        matches: Array.from(matches),
        missing,
        score,
        weightedScore: Math.round((weightedMatchCount / (totalJdKeywordsCount * 2.0)) * 100), // Secondary metric
        jdRawMapping
    };
};
