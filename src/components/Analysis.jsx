import React, { useState, useEffect } from 'react';
import { useResume } from '../context/ResumeContext';
import { generateSuggestions } from '../utils/suggestionEngine';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, Check, X, Zap } from 'lucide-react';

const Analysis = () => {
    const { analysis, resume, updateResume } = useResume();
    const [suggestions, setSuggestions] = useState([]);
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

    useEffect(() => {
        if (analysis) {
            if (analysis.score >= 60 && analysis.score < 90 && analysis.missing.length > 0) {
                const sugs = generateSuggestions(
                    resume.experience,
                    resume.projects,
                    resume.skills,
                    resume.personalInfo.summary,
                    analysis
                );
                setSuggestions(sugs);
                setCurrentSuggestionIndex(0);
            } else {
                setSuggestions([]);
                setCurrentSuggestionIndex(0);
            }
        }
    }, [analysis, resume.experience, resume.projects, resume.skills, resume.personalInfo.summary]);

    if (!analysis) return null;

    const currentSuggestion = suggestions[currentSuggestionIndex];

    const getScoreLabel = (score) => {
        if (score >= 90) return { label: 'Excellent Match', color: 'text-green-400' };
        if (score >= 75) return { label: 'Strong Candidate', color: 'text-emerald-400' };
        if (score >= 60) return { label: 'Moderate Match', color: 'text-yellow-400' };
        if (score >= 40) return { label: 'Weak Match', color: 'text-orange-400' };
        return { label: 'Poor Match', color: 'text-red-400' };
    };

    const scoreInfo = getScoreLabel(analysis.score);

    const handleApprove = () => {
        const { type, itemId, lineIndex, suggested } = currentSuggestion;

        if (type === 'profileSummary' || type === 'profileSummaryAppend') {
            const lines = (resume.personalInfo.summary || '').split('\n').filter(l => l.trim() !== '');
            if (type === 'profileSummary') {
                lines[lineIndex] = suggested;
            } else {
                lines.push(suggested);
            }
            updateResume({
                personalInfo: {
                    ...resume.personalInfo,
                    summary: lines.join('\n')
                }
            });
        } else if (type === 'skillRename') {
            const listKey = itemId; // category key like 'languages'
            const currentSkills = [...(resume.skills[listKey] || [])];
            currentSkills[lineIndex] = suggested;
            updateResume({
                skills: {
                    ...resume.skills,
                    [listKey]: currentSkills
                }
            });
        } else {
            const listKey = (type === 'experience' || type === 'experienceNewBullet') ? 'experience' : 'projects';
            const items = [...resume[listKey]];
            const itemIdx = items.findIndex(i => i.id === itemId);

            if (itemIdx !== -1) {
                const lines = (items[itemIdx].description || '').split('\n').filter(l => l.trim() !== '');
                if (type === 'experienceNewBullet') {
                    lines.push(suggested);
                } else {
                    lines[lineIndex] = suggested;
                }
                items[itemIdx] = { ...items[itemIdx], description: lines.join('\n') };
                updateResume({ [listKey]: items });
            }
        }

        setCurrentSuggestionIndex(prev => prev + 1);
    };

    const handleDecline = () => {
        setCurrentSuggestionIndex(prev => prev + 1);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">Match Analysis</h2>
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400">Match Score</div>
                    <div className={`text-4xl font-bold ${scoreInfo.color}`}>
                        {analysis.score}%
                    </div>
                </div>
                <div className={`text-sm font-bold mb-6 ${scoreInfo.color} uppercase tracking-wider`}>
                    {scoreInfo.label}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-green-400 flex items-center"><CheckCircle size={14} className="mr-1" /> Strong Match</h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.matches.map(kw => <span key={kw} className="px-2 py-1 bg-green-400/10 text-green-400 text-xs rounded border border-green-400/20">✓ {kw}</span>)}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-red-400 flex items-center"><XCircle size={14} className="mr-1" /> Missing Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missing.map(kw => <span key={kw} className="px-2 py-1 bg-red-400/10 text-red-400 text-xs rounded border border-red-400/20">⚠ {kw}</span>)}
                        </div>
                    </div>
                </div>

                {analysis.score < 60 && (
                    <div className="mt-6 p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-start space-x-3">
                        <AlertTriangle className="text-red-400 shrink-0" size={20} />
                        <p className="text-sm text-red-200">You may be underqualified for this role.</p>
                    </div>
                )}

                {analysis.score >= 90 && (
                    <div className="mt-6 p-4 bg-green-400/10 border border-green-400/20 rounded-xl flex items-start space-x-3">
                        <CheckCircle className="text-green-400 shrink-0" size={20} />
                        <p className="text-sm text-green-200">Your resume already aligns well with this job description.</p>
                    </div>
                )}
            </div>

            {currentSuggestion && (
                <div className="bg-indigo-600/20 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-indigo-400/30 border-dashed animate-pulse">
                    <h3 className="text-indigo-400 font-bold mb-4 flex items-center">
                        <Zap size={18} className="mr-2" /> Improvement Suggestion
                    </h3>
                    <div className="space-y-4">
                        <div className="text-sm text-gray-400 line-through">{currentSuggestion.original}</div>
                        <div className="flex items-center text-indigo-200">
                            <ArrowRight size={16} className="mx-2" />
                            <div className="font-medium text-justify">{currentSuggestion.suggested}</div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button onClick={handleDecline} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center"><X size={16} className="mr-1" /> Skip</button>
                            <button onClick={handleApprove} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-lg transition-all flex items-center"><Check size={16} className="mr-1" /> Approve</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analysis;
