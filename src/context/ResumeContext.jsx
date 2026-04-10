import React, { createContext, useContext, useState, useEffect } from 'react';

const ResumeContext = createContext();

export const useResume = () => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error('useResume must be used within a ResumeProvider');
    }
    return context;
};

const INITIAL_RESUME = {
    personalInfo: {
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        availability: 'Immediately Available',
        linkedin: '',
        portfolio: '',
        github: '',
        photo: null
    },
    skills: [
        { id: 'languages', name: 'Programming Languages', items: [] },
        { id: 'backend', name: 'Backend Development', items: [] },
        { id: 'frontend', name: 'Frontend Development', items: [] },
        { id: 'apiSecurity', name: 'APIs & Security', items: [] },
        { id: 'databases', name: 'Databases', items: [] },
        { id: 'devops', name: 'DevOps & Cloud', items: [] },
        { id: 'tools', name: 'Tools & Version Control', items: [] }
    ],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    settings: {
        // Existing / migrated
        // Document settings
        pdfFileName: '',

        // Typography
        fontFamily: 'Serif Pro',
        fontSize: 10,
        photoSize: 80,

        // Spacing
        lineHeight: 1.15,
        leftRightMargin: 34,   // pt
        topBottomMargin: 28,   // pt
        spaceBeforeEntries: 4, // pt

        // Section Headings
        sectionHeadingStyle: 'underline', // underline|topline|box|shaded|plain|sideline|double|wavy
        sectionHeadingCapitalization: 'uppercase', // capitalize|uppercase
        sectionHeadingSize: 'S',   // S|M|L|XL
        sectionHeadingIcons: 'none', // none|outline|filled

        // Entry Styling
        titleSize: 'S',            // S|M|L
        subtitleStyle: 'normal',   // normal|bold|italic
        subtitlePlacement: 'same', // same|next
        indentBody: true,
        listStyle: 'hyphen',       // bullet|hyphen

        // Header
        headerAlign: 'left',       // left|center|right
        headerArrangement: 'standard', // standard|compact|extended
        personalDetailsLayout: 'separated', // separated|inline|compact
        nameSize: 'M',             // XS|S|M|L|XL
        nameBold: true,
        nameFont: 'body',          // body|creative
        titlePosition: 'below',    // sameLine|below
        titleStyle: 'normal',      // normal|italic
        showPhoto: true,
        photoGrayscale: false,
        photoShape: 'square',      // circle|square|squircle|rounded

        // Skills display
        skillsStyle: 'compact',    // compact|pipe|newLine|grid|bubble|bullet|dash|columns

        // Section order
        sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],

        // Visible sections
        visibleSections: {
            summary: true,
            skills: true,
            experience: true,
            projects: true,
            education: true,
            certifications: true
        }
    }
};

export const ResumeProvider = ({ children }) => {
    const [resume, setResume] = useState(() => {
        const savedResume = localStorage.getItem('base_resume');
        if (savedResume) {
            const parsed = JSON.parse(savedResume);

            // Migration: convert bullets array to single description string if needed
            const migrateItems = (items) => (items || []).map(item => ({
                ...item,
                description: item.description || (Array.isArray(item.bullets) ? item.bullets.join('\n') : '')
            }));

            // Migration: convert skills object to array of objects
            const migrateSkills = (skills) => {
                if (Array.isArray(skills)) return skills;
                
                const skillMapping = {
                    languages: 'Programming Languages',
                    backend: 'Backend Development',
                    frontend: 'Frontend Development',
                    apiSecurity: 'APIs & Security',
                    databases: 'Databases',
                    devops: 'DevOps & Cloud',
                    tools: 'Tools & Version Control'
                };
                
                return Object.entries(skills || {}).map(([key, items]) => ({
                    id: key,
                    name: skillMapping[key] || (key.charAt(0).toUpperCase() + key.slice(1)),
                    items: items || []
                }));
            };

            return {
                ...INITIAL_RESUME,
                ...parsed,
                experience: migrateItems(parsed.experience),
                projects: migrateItems(parsed.projects),
                skills: migrateSkills(parsed.skills),
                settings: { ...INITIAL_RESUME.settings, ...(parsed.settings || {}) }
            };
        }
        return INITIAL_RESUME;
    });

    const [baseResumeSnapshot, setBaseResumeSnapshot] = useState(() => {
        const savedSnapshot = localStorage.getItem('base_resume_snapshot');
        return savedSnapshot ? JSON.parse(savedSnapshot) : null;
    });

    const [isBaseSet, setIsBaseSet] = useState(false);
    const [jd, setJd] = useState('');
    const [analysis, setAnalysis] = useState(null);

    useEffect(() => {
        localStorage.setItem('base_resume', JSON.stringify(resume));
    }, [resume]);

    useEffect(() => {
        if (baseResumeSnapshot) {
            localStorage.setItem('base_resume_snapshot', JSON.stringify(baseResumeSnapshot));
        }
    }, [baseResumeSnapshot]);

    const updateResume = (newData) => {
        setResume(prev => ({ ...prev, ...newData }));
    };

    const updateSettings = (newSettings) => {
        setResume(prev => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings }
        }));
    };

    const saveBaseSnapshot = () => {
        setBaseResumeSnapshot(JSON.parse(JSON.stringify(resume)));
        setIsBaseSet(true);
        setTimeout(() => setIsBaseSet(false), 2000);
    };

    const resetToSnapshot = () => {
        if (baseResumeSnapshot) {
            setResume(JSON.parse(JSON.stringify(baseResumeSnapshot)));
        }
    };

    const value = {
        resume,
        baseResumeSnapshot,
        isBaseSet,
        updateResume,
        updateSettings,
        saveBaseSnapshot,
        resetToSnapshot,
        jd,
        setJd,
        analysis,
        setAnalysis
    };

    return (
        <ResumeContext.Provider value={value}>
            {children}
        </ResumeContext.Provider>
    );
};
