import React from 'react';
import { useResume } from '../context/ResumeContext';
import { extractKeywords, compareKeywords } from '../utils/keywordExtractor';
import { FileText, Zap } from 'lucide-react';

const JDInput = () => {
    const { jd, setJd, setAnalysis, resume } = useResume();

    const handleAnalyze = () => {
        const keywords = extractKeywords(jd);
        const comparison = compareKeywords(resume, keywords);
        setAnalysis(comparison);
    };

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center space-x-2 mb-4 text-indigo-400">
                <FileText size={20} />
                <h2 className="text-xl font-bold text-white">Job Description</h2>
            </div>
            <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 h-64 mb-4"
            />
            <button
                onClick={handleAnalyze}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center space-x-2"
            >
                <Zap size={20} />
                <span>Analyze Matching Keywords</span>
            </button>
        </div>
    );
};

export default JDInput;
