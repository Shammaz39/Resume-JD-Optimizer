const CATEGORIES = {
  languages: [
    "java","python","go","golang","ruby","javascript","typescript",
    "kotlin","scala","rust","php","swift","dart","c++","c#", "bash", "shell", "powershell"
  ],

  frameworks: [
    "spring","spring boot","spring mvc","spring security",
    "django","flask","rails","ruby on rails",
    "express","nodejs","node.js","nestjs","nextjs","react","react.js","reactjs","angular","vue","vue.js","svelte",
    "hibernate","struts","quarkus","micronaut","fastapi","laravel"
  ],

  architecture: [
    "microservices","microservice","monolith","monolithic",
    "distributed systems","event driven architecture",
    "domain driven design","ddd","clean architecture",
    "hexagonal architecture","layered architecture",
    "rest","rest api","restful api","graphql","grpc",
    "api gateway","service mesh","serverless","mvc", "service oriented architecture", "soa"
  ],

  databases: [
    "mysql","postgres","postgresql","mongodb","redis","cassandra",
    "dynamodb","oracle","sql server","sqlite","mariadb",
    "elasticsearch","opensearch", "neo4j", "couchdb"
  ],

  devops: [
    "docker","kubernetes","k8s","helm","terraform","ansible",
    "ci/cd","ci cd","cicd","jenkins","gitlab","gitlab ci", "github actions","circleci",
    "travis","bamboo","git","bitbucket", "argocd", "puppet", "chef", "prometheus", "grafana"
  ],

  messaging: [
    "kafka","rabbitmq","activemq","sqs","pubsub",
    "google pubsub","event streaming","message queue", "celery", "sns", "kinesis"
  ],

  cloud: [
    "aws","amazon web services","gcp","google cloud","google cloud platform",
    "azure","microsoft azure", "ec2","s3","lambda","cloud run",
    "cloud functions","rds","cloudformation", "eks", "gke", "aks", "ecs", "fargate"
  ],

  testing: [
    "unit testing","integration testing","test automation",
    "junit","mockito","pytest","selenium","cypress",
    "jest","testng","bdd","tdd", "playwright", "puppeteer", "mocha", "chai"
  ],

  frontend: [
    "html", "html5", "css", "css3", "sass", "scss", "less", "tailwind", "tailwindcss",
    "bootstrap", "material ui", "mui", "webpack", "vite", "babel", "redux", "mobx", "zustand"
  ],

  mobile: [
    "react native", "flutter", "ios", "android", "swiftui", "jetpack compose"
  ],

  data: [
    "pandas", "numpy", "scikit-learn", "tensorflow", "keras", "pytorch",
    "hadoop", "spark", "apache spark", "airflow", "dbt", "snowflake", "bigquery", "redshift"
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
  "node.js": "Node.js",

  "ci/cd pipeline": "CI/CD",
  "ci cd": "CI/CD",
  "cicd": "CI/CD",

  "aws cloud": "AWS",
  "amazon web services": "AWS",

  "gcp": "Google Cloud",
  "google cloud": "Google Cloud",
  "google cloud platform": "Google Cloud",

  "azure": "Azure",
  "microsoft azure": "Azure",

  "reactjs": "React",
  "react.js": "React",
  "react": "React",

  "vuejs": "Vue",
  "vue.js": "Vue",
  "vue": "Vue",

  "k8s": "Kubernetes",
  "kubernetes": "Kubernetes",

  "js": "JavaScript",
  "javascript": "JavaScript",

  "ts": "TypeScript",
  "typescript": "TypeScript"
};

export const normalize = (word) => {
    const lower = word.toLowerCase().trim();
    return NORMALIZATION_MAP[lower] || word;
};

export const getSynonyms = (normalizedKeyword) => {
    if (!normalizedKeyword) return [];
    const synonyms = new Set();
    const lowerNorm = normalizedKeyword.toLowerCase();

    Object.keys(NORMALIZATION_MAP).forEach(k => {
        if (NORMALIZATION_MAP[k].toLowerCase() === lowerNorm) {
            synonyms.add(k);
        }
    });

    Object.values(CATEGORIES).flat().forEach(k => {
        if (normalize(k).toLowerCase() === lowerNorm) {
            synonyms.add(k.toLowerCase());
        }
    });

    synonyms.add(lowerNorm);
    return Array.from(synonyms);
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
            if (idx < cleanedText.length / 2) {
                cleanedText = cleanedText.slice(idx + ck.length);
            } else {
                cleanedText = cleanedText.slice(0, idx);
            }
        }
    });

    Object.values(CATEGORIES).flat().forEach(keyword => {
        // Use word boundaries for matching to avoid partial matches
        const regex = new RegExp(`\\b${keyword.replace('.', '\\.')}\\b`, 'i');
        const match = text.match(regex);
        if (match && regex.test(cleanedText)) {
            if (!STOPWORDS.includes(keyword)) {
                const norm = normalize(keyword);
                foundNorms.add(norm);
                if (!rawMap[norm]) {
                    rawMap[norm] = match[0];
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

    const jdByCategory = {};
    Object.entries(CATEGORIES).forEach(([cat, keywords]) => {
        const presentInJD = jdNorms.filter(k => {
            const normK = k.toLowerCase();
            return keywords.some(dictK => normalize(dictK).toLowerCase() === normK);
        });
        if (presentInJD.length > 0) jdByCategory[cat] = presentInJD;
    });

    const checkMatch = (keyword, text) => {
        if (!text) return false;
        const normK = keyword.toLowerCase();

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
                weightedMatchCount += 1.0;
            }
        });
    }

    const score = Math.round((matches.size / totalJdKeywordsCount) * 100);

    return {
        matches: Array.from(matches),
        missing,
        score,
        weightedScore: Math.round((weightedMatchCount / (totalJdKeywordsCount * 2.0)) * 100),
        jdRawMapping
    };
};
