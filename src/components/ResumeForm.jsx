import React, { useState, useRef } from 'react';
import { useResume } from '../context/ResumeContext';
import { Plus, Trash2, Save, User, Settings as SettingsIcon, Eye, EyeOff, Check, ChevronDown, ChevronRight, Bold, Italic, Underline } from 'lucide-react';

const RichTextArea = ({ value, onChange, placeholder }) => {
    const textareaRef = useRef(null);

    const applyFormat = (prefix, suffix) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        if (start === end) return;

        const selectedText = value.substring(start, end);
        const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);

        onChange({ target: { value: newText } });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    return (
        <div className="w-full bg-white/5 border border-white/10 rounded-lg overflow-hidden focus-within:border-indigo-500 transition-colors flex flex-col">
            <div className="flex bg-white/10 px-2 py-1 border-b border-white/10 gap-1">
                <button type="button" onClick={() => applyFormat('**', '**')} className="p-1 text-gray-400 hover:text-white hover:bg-white/20 rounded transition-colors" title="Bold"><Bold size={12} /></button>
                <button type="button" onClick={() => applyFormat('*', '*')} className="p-1 text-gray-400 hover:text-white hover:bg-white/20 rounded transition-colors" title="Italic"><Italic size={12} /></button>
                <button type="button" onClick={() => applyFormat('_', '_')} className="p-1 text-gray-400 hover:text-white hover:bg-white/20 rounded transition-colors" title="Underline"><Underline size={12} /></button>
            </div>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-transparent p-2.5 text-white text-[11px] h-24 resize-none outline-none scrollbar-hide"
            />
        </div>
    );
};

const ResumeForm = () => {
    const { resume, updateResume, saveBaseSnapshot, updateSettings, isBaseSet } = useResume();
    const [activeTab, setActiveTab] = useState('personal');
    const [openSettingSection, setOpenSettingSection] = useState('layout');

    const CollapsibleSection = ({ id, title, children }) => (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-3 shadow-sm">
            <button
                onClick={() => setOpenSettingSection(openSettingSection === id ? null : id)}
                className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 transition-colors text-white"
            >
                <span className="font-bold text-[13px]">{title}</span>
                {openSettingSection === id ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
            </button>
            {openSettingSection === id && <div className="p-4 border-t border-white/10 space-y-5">{children}</div>}
        </div>
    );

    const handlePersonalChange = (e) => {
        updateResume({ personalInfo: { ...resume.personalInfo, [e.target.name]: e.target.value } });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    // Create a canvas to resize the image
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400; // Limit size for PDF stability
                    const scale = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scale;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Convert to high-quality JPEG
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    updateResume({ personalInfo: { ...resume.personalInfo, photo: compressedDataUrl } });
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const addSkill = (category, skill) => {
        if (!skill.trim()) return;
        const currentSkills = resume.skills[category] || [];
        if (!currentSkills.includes(skill.trim())) {
            updateResume({
                skills: {
                    ...resume.skills,
                    [category]: [...currentSkills, skill.trim()]
                }
            });
        }
    };

    const removeSkill = (category, index) => {
        const currentSkills = resume.skills[category] || [];
        const newSkills = [...currentSkills];
        newSkills.splice(index, 1);
        updateResume({
            skills: {
                ...resume.skills,
                [category]: newSkills
            }
        });
    };

    const SkillBadge = ({ name, onRemove }) => (
        <span className="flex items-center space-x-1.5 bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md border border-indigo-500/30 group animate-in zoom-in duration-200">
            <span className="font-medium">{name}</span>
            <button
                onClick={onRemove}
                className="hover:text-red-400 text-indigo-500/50 transition-colors"
            >
                <Trash2 size={12} />
            </button>
        </span>
    );

    const SkillInput = ({ category, label, placeholder }) => {
        const [inputValue, setInputValue] = useState('');

        const handleKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const part = inputValue.replace(',', '').trim();
                if (part) {
                    addSkill(category, part);
                    setInputValue('');
                }
            }
        };

        return (
            <div className="space-y-2">
                <label className="text-indigo-400 font-bold flex justify-between items-center">
                    <span>{label}</span>
                    <span className="text-[10px] text-gray-500 font-normal">Press Enter or comma to add</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[0px]">
                    {(resume.skills[category] || []).map((skill, idx) => (
                        <SkillBadge key={idx} name={skill} onRemove={() => removeSkill(category, idx)} />
                    ))}
                </div>
                <input
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        if (inputValue.trim()) {
                            addSkill(category, inputValue.trim());
                            setInputValue('');
                        }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white placeholder:text-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                />
            </div>
        );
    };

    const addArrayItem = (key, initialValue) => {
        const currentItems = resume[key] || [];
        updateResume({ [key]: [...currentItems, { ...initialValue, id: Date.now() }] });
    };

    const updateArrayItem = (key, id, newData) => {
        updateResume({
            [key]: resume[key].map(item => item.id === id ? { ...item, ...newData } : item)
        });
    };

    const deleteArrayItem = (key, id) => {
        updateResume({ [key]: resume[key].filter(item => item.id !== id) });
    };

    const toggleSection = (section) => {
        updateSettings({
            visibleSections: {
                ...resume.settings.visibleSections,
                [section]: !resume.settings.visibleSections[section]
            }
        });
    };

    const tabs = [
        { id: 'personal', label: 'Personal' },
        { id: 'experience', label: 'Experience' },
        { id: 'projects', label: 'Projects' },
        { id: 'skills', label: 'Skills' },
        { id: 'education', label: 'Education' },
        { id: 'certs', label: 'Certs' },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon size={14} /> }
    ];

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide max-w-[70%]">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg transition-all text-xs font-medium whitespace-nowrap flex items-center space-x-1 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                } capitalize`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
                <button
                    onClick={saveBaseSnapshot}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ml-4 shrink-0 ${isBaseSet ? 'bg-green-500 scale-105' : 'bg-green-600 hover:bg-green-500'
                        } text-white`}
                    title="Save as Base Resume"
                >
                    {isBaseSet ? <Check size={14} /> : <Save size={14} />}
                    <span>{isBaseSet ? 'Base Set!' : 'Set Base'}</span>
                </button>
            </div>

            {activeTab === 'personal' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-white/20">
                            {resume.personalInfo.photo ? (
                                <img src={resume.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-white" size={32} />
                            )}
                        </div>
                        <div className="flex flex-col space-y-2">
                            <input type="file" onChange={handlePhotoChange} className="text-xs text-gray-400" />
                            {resume.personalInfo.photo && (
                                <button
                                    onClick={() => updateResume({ personalInfo: { ...resume.personalInfo, photo: null } })}
                                    className="text-[10px] text-red-500 hover:text-red-400 font-bold flex items-center"
                                >
                                    <Trash2 size={12} className="mr-1" /> Remove Photo
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <input name="name" value={resume.personalInfo.name} onChange={handlePersonalChange} placeholder="Full Name" className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-500" />
                        <input name="title" value={resume.personalInfo.title} onChange={handlePersonalChange} placeholder="Headline" className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-500" />
                        <input name="email" value={resume.personalInfo.email} onChange={handlePersonalChange} placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-500" />
                        <input name="phone" value={resume.personalInfo.phone} onChange={handlePersonalChange} placeholder="Phone" className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-500" />
                        <input name="location" value={resume.personalInfo.location} onChange={handlePersonalChange} placeholder="Location" className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-500" />
                        <input name="availability" value={resume.personalInfo.availability} onChange={handlePersonalChange} placeholder="Availability" className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-500" />
                        <input name="linkedin" value={resume.personalInfo.linkedin} onChange={handlePersonalChange} placeholder="LinkedIn URL" className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-500" />
                        <input name="portfolio" value={resume.personalInfo.portfolio} onChange={handlePersonalChange} placeholder="Portfolio URL" className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-500" />
                        <input name="github" value={resume.personalInfo.github} onChange={handlePersonalChange} placeholder="GitHub URL" className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-500" />
                    </div>
                    <textarea name="summary" value={resume.personalInfo.summary} onChange={handlePersonalChange} placeholder="Professional Summary" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:border-indigo-500 h-24" />
                </div>
            )}

            {activeTab === 'experience' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {resume.experience.map(exp => (
                        <div key={exp.id} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
                            <div className="flex justify-between items-center">
                                <input value={exp.company} onChange={(e) => updateArrayItem('experience', exp.id, { company: e.target.value })} placeholder="Company Name" className="bg-transparent border-none text-sm font-bold text-white focus:outline-none w-full" />
                                <button onClick={() => deleteArrayItem('experience', exp.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <input value={exp.role} onChange={(e) => updateArrayItem('experience', exp.id, { role: e.target.value })} placeholder="Role" className="bg-transparent border-none text-gray-300 focus:outline-none" />
                                <input value={exp.date} onChange={(e) => updateArrayItem('experience', exp.id, { date: e.target.value })} placeholder="Date Range" className="bg-transparent border-none text-indigo-400 text-right focus:outline-none" />
                            </div>
                            <input value={exp.location} onChange={(e) => updateArrayItem('experience', exp.id, { location: e.target.value })} placeholder="Location" className="w-full bg-transparent border-none text-[10px] text-gray-500 focus:outline-none mb-1" />

                            <RichTextArea
                                value={exp.description || ''}
                                onChange={(e) => updateArrayItem('experience', exp.id, { description: e.target.value })}
                                placeholder="Job Description (One bullet per line)"
                            />
                        </div>
                    ))}
                    <button onClick={() => addArrayItem('experience', { company: '', role: '', date: '', location: '', description: '' })} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-gray-400 text-xs hover:border-indigo-500 hover:text-white transition-colors flex items-center justify-center">
                        <Plus className="mr-2" size={14} /> Add Experience
                    </button>
                </div>
            )}

            {activeTab === 'projects' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {(resume.projects || []).map(proj => (
                        <div key={proj.id} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
                            <div className="flex justify-between items-center">
                                <input value={proj.name} onChange={(e) => updateArrayItem('projects', proj.id, { name: e.target.value })} placeholder="Project Name" className="bg-transparent border-none text-sm font-bold text-white focus:outline-none w-full" />
                                <button onClick={() => deleteArrayItem('projects', proj.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                            </div>
                            <div className="flex flex-col gap-1.5 text-[10px]">
                                <input value={proj.github} onChange={(e) => updateArrayItem('projects', proj.id, { github: e.target.value })} placeholder="GitHub Repository URL" className="bg-transparent border-none text-indigo-400 focus:outline-none w-full" />
                                <input value={proj.frontend} onChange={(e) => updateArrayItem('projects', proj.id, { frontend: e.target.value })} placeholder="Live Frontend URL" className="bg-transparent border-none text-indigo-400 focus:outline-none w-full" />
                                <input value={proj.backend} onChange={(e) => updateArrayItem('projects', proj.id, { backend: e.target.value })} placeholder="Live Backend URL" className="bg-transparent border-none text-indigo-400 focus:outline-none w-full" />
                            </div>

                            <RichTextArea
                                value={proj.description || ''}
                                onChange={(e) => updateArrayItem('projects', proj.id, { description: e.target.value })}
                                placeholder="Project Description (One bullet per line)"
                            />
                        </div>
                    ))}
                    <button onClick={() => addArrayItem('projects', { name: '', description: '', github: '', frontend: '', backend: '' })} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-gray-400 text-xs hover:border-indigo-500 hover:text-white transition-colors flex items-center justify-center">
                        <Plus className="mr-2" size={14} /> Add Project
                    </button>
                </div>
            )}

            {activeTab === 'skills' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 text-xs pb-4">
                    {[
                        { id: 'languages', label: 'Programming Languages', placeholder: 'Python, Javascript, Java...' },
                        { id: 'backend', label: 'Backend Development', placeholder: 'Node.js, Express, Django...' },
                        { id: 'frontend', label: 'Frontend Development', placeholder: 'React, Tailwind, Vue...' },
                        { id: 'apiSecurity', label: 'APIs & Security', placeholder: 'REST, GraphQL, OAuth...' },
                        { id: 'databases', label: 'Databases', placeholder: 'MongoDB, PostgreSQL, Redis...' },
                        { id: 'devops', label: 'DevOps & Cloud', placeholder: 'Docker, AWS, CI/CD...' },
                        { id: 'tools', label: 'Tools & Version Control', placeholder: 'Git, VS Code, Jira...' },
                    ].map(cat => (
                        <SkillInput
                            key={cat.id}
                            category={cat.id}
                            label={cat.label}
                            placeholder={cat.placeholder}
                        />
                    ))}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 text-xs text-white">
                    <CollapsibleSection id="layout" title="Layout">
                        <div>
                            <h3 className="text-indigo-400 font-bold mb-3">Content Columns</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {['One', 'Two', 'Mix'].map(col => (
                                    <button
                                        key={col}
                                        disabled={col !== 'One'}
                                        className={`p-2 rounded-lg border text-center transition-all ${col === 'One' ? 'bg-indigo-600 border-indigo-400 shadow-lg' : 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed opacity-50'}`}
                                    >
                                        <span className="text-[11px] font-bold">{col}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-indigo-400 font-bold mb-3">Visible Sections</h3>
                            <p className="text-[10px] text-gray-500 mb-2">Toggle eye icon to show/hide sections.</p>
                            <div className="space-y-2">
                                {['summary', 'skills', 'experience', 'projects', 'education', 'certifications'].map((section) => (
                                    <div
                                        key={`section-toggle-${section}`}
                                        className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 hover:border-indigo-500 transition-colors"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <span className="capitalize">{section}</span>
                                        </div>
                                        <button onClick={() => toggleSection(section)} className="text-indigo-400 hover:text-indigo-300 transition-colors px-2">
                                            {resume.settings.visibleSections[section] !== false ? <Eye size={16} /> : <EyeOff size={16} className="text-gray-600" />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection id="spacing" title="Spacing">
                        {/* Spacing Controls */}
                        <div>
                            <h3 className="text-indigo-400 font-bold mb-3 flex justify-between">
                                <span>Font Selection</span>
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {['Calibri', 'Arial', 'Cambria', 'Serif Pro', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Merriweather'].map(font => (
                                    <button
                                        key={font}
                                        onClick={() => updateSettings({ fontFamily: font })}
                                        className={`p-2 rounded-lg border flex flex-col items-center transition-all ${resume.settings.fontFamily === font ? 'bg-indigo-600 border-indigo-400 shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                        style={{ fontFamily: font === 'Cambria' || font === 'Serif Pro' || font === 'Merriweather' ? 'serif' : 'sans-serif' }}
                                    >
                                        <span className="text-[10px] font-bold">{font}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div>
                                <h3 className="text-gray-300 font-bold mb-2 flex justify-between text-[11px]">
                                    <span>Font Size</span>
                                    <span className="text-white">{resume.settings.fontSize}pt</span>
                                </h3>
                                <input type="range" min="8" max="14" step="0.5" value={resume.settings.fontSize} onChange={(e) => updateSettings({ fontSize: parseFloat(e.target.value) })} className="w-full accent-indigo-500" />
                            </div>

                            <div>
                                <h3 className="text-gray-300 font-bold mb-2 flex justify-between text-[11px]">
                                    <span>Line Height</span>
                                    <span className="text-white">{resume.settings.lineHeight || 1.15}</span>
                                </h3>
                                <input type="range" min="1.0" max="2.0" step="0.05" value={resume.settings.lineHeight || 1.15} onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })} className="w-full accent-indigo-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-gray-300 font-bold mb-2 flex justify-between text-[11px]">
                                        <span>Left/Right Margin</span>
                                        <span className="text-white">{resume.settings.leftRightMargin ?? 34}pt</span>
                                    </h3>
                                    <input type="range" min="10" max="80" step="1" value={resume.settings.leftRightMargin ?? 34} onChange={(e) => updateSettings({ leftRightMargin: parseInt(e.target.value) })} className="w-full accent-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-gray-300 font-bold mb-2 flex justify-between text-[11px]">
                                        <span>Top/Bottom Margin</span>
                                        <span className="text-white">{resume.settings.topBottomMargin ?? 28}pt</span>
                                    </h3>
                                    <input type="range" min="10" max="80" step="1" value={resume.settings.topBottomMargin ?? 28} onChange={(e) => updateSettings({ topBottomMargin: parseInt(e.target.value) })} className="w-full accent-indigo-500" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-300 font-bold mb-2 flex justify-between text-[11px]">
                                    <span>Space Between Entries</span>
                                    <span className="text-white">{resume.settings.spaceBeforeEntries ?? 4}pt</span>
                                </h3>
                                <input type="range" min="0" max="20" step="0.5" value={resume.settings.spaceBeforeEntries ?? 4} onChange={(e) => updateSettings({ spaceBeforeEntries: parseFloat(e.target.value) })} className="w-full accent-indigo-500" />
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection id="sectionHeadings" title="Section Headings">
                        <div>
                            <h3 className="text-indigo-400 font-bold mb-3">Style</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['underline', 'wrap', 'topline', 'box', 'shaded', 'plain', 'sideline', 'double', 'wavy'].map(style => (
                                    <button
                                        key={style}
                                        onClick={() => updateSettings({ sectionHeadingStyle: style })}
                                        className={`px-3 py-2 rounded-lg border transition-all text-center capitalize ${resume.settings.sectionHeadingStyle === style ? 'bg-indigo-600 border-indigo-400 shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-[11px] font-bold">{style === 'wrap' ? 'Wrap Underline' : style}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-indigo-400 font-bold mb-3">Capitalization</h3>
                                <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                    {['capitalize', 'uppercase'].map(cap => (
                                        <button
                                            key={cap}
                                            onClick={() => updateSettings({ sectionHeadingCapitalization: cap })}
                                            className={`flex-1 py-1.5 text-center transition-all ${resume.settings.sectionHeadingCapitalization === cap ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-white/10'}`}
                                        >
                                            <span className="text-[11px] capitalize">{cap}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-indigo-400 font-bold mb-3">Size</h3>
                                <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                    {['S', 'M', 'L', 'XL'].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => updateSettings({ sectionHeadingSize: size })}
                                            className={`flex-1 py-1.5 text-center transition-all ${resume.settings.sectionHeadingSize === size ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-white/10'}`}
                                        >
                                            <span className="text-[11px] font-bold">{size}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-indigo-400 font-bold mb-3">Icons</h3>
                            <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                {['none', 'outline', 'filled'].map(icon => (
                                    <button
                                        key={icon}
                                        onClick={() => updateSettings({ sectionHeadingIcons: icon })}
                                        className={`flex-1 py-1.5 text-center transition-all ${resume.settings.sectionHeadingIcons === icon ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-[11px] capitalize">{icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection id="entryStyling" title="Entry Styling">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-indigo-400 font-bold mb-3">Title Size</h3>
                                <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                    {['S', 'M', 'L'].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => updateSettings({ titleSize: size })}
                                            className={`flex-1 py-1.5 text-center transition-all ${resume.settings.titleSize === size ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-white/10'}`}
                                        >
                                            <span className="text-[11px] font-bold">{size}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-indigo-400 font-bold mb-3">Subtitle Style</h3>
                                <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                    {['normal', 'bold', 'italic'].map(style => (
                                        <button
                                            key={style}
                                            onClick={() => updateSettings({ subtitleStyle: style })}
                                            className={`flex-1 py-1.5 text-center transition-all ${resume.settings.subtitleStyle === style ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-white/10'}`}
                                        >
                                            <span className="text-[11px] capitalize">{style}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-indigo-400 font-bold mb-3">Subtitle Placement</h3>
                            <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                {[{ id: 'same', label: 'Try Same Line' }, { id: 'next', label: 'Next Line' }].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => updateSettings({ subtitlePlacement: t.id })}
                                        className={`flex-1 py-1.5 text-center transition-all ${resume.settings.subtitlePlacement === t.id ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-[11px]">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-indigo-400 font-bold mb-3">List Style</h3>
                                <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                    {['bullet', 'hyphen'].map(style => (
                                        <button
                                            key={style}
                                            onClick={() => updateSettings({ listStyle: style })}
                                            className={`flex-1 py-1.5 text-center transition-all ${resume.settings.listStyle === style ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-white/10'}`}
                                        >
                                            <span className="text-[11px] capitalize">{style}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-indigo-400 font-bold mb-3">Indent Body</h3>
                                <label className="flex items-center space-x-2 cursor-pointer bg-white/5 rounded-lg border border-white/10 p-1.5 h-8">
                                    <input
                                        type="checkbox"
                                        checked={resume.settings.indentBody}
                                        onChange={(e) => updateSettings({ indentBody: e.target.checked })}
                                        className="ml-2 accent-indigo-500 rounded"
                                    />
                                    <span className="text-[11px] text-gray-300">Indent Body Text</span>
                                </label>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection id="header" title="Header">
                        <div>
                            <h3 className="text-indigo-400 font-bold mb-3">Align</h3>
                            <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                {['left', 'center', 'right'].map(align => (
                                    <button
                                        key={align}
                                        onClick={() => updateSettings({ headerAlign: align })}
                                        className={`flex-1 py-1.5 text-center transition-all ${resume.settings.headerAlign === align ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-[11px] capitalize">{align}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-indigo-400 font-bold mb-3">Arrangement</h3>
                            <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                {['standard', 'compact', 'extended'].map(arr => (
                                    <button
                                        key={arr}
                                        onClick={() => updateSettings({ headerArrangement: arr })}
                                        className={`flex-1 py-1.5 text-center transition-all ${resume.settings.headerArrangement === arr ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-[11px] capitalize">{arr}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-indigo-400 font-bold mb-3">Contact Info Breakdown</h3>
                            <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                {['separated', 'inline', 'compact'].map(layout => (
                                    <button
                                        key={`layout-${layout}`}
                                        onClick={() => updateSettings({ personalDetailsLayout: layout })}
                                        className={`flex-1 py-1.5 text-center transition-all ${resume.settings.personalDetailsLayout === layout ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-[11px] capitalize">{layout}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                            <h3 className="text-gray-300 font-bold mb-3 text-[11px]">Name Settings</h3>
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <span className="text-[10px] text-gray-500 block mb-1">Size</span>
                                    <div className="flex bg-white/10 rounded overflow-hidden">
                                        {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                                            <button
                                                key={size}
                                                onClick={() => updateSettings({ nameSize: size })}
                                                className={`flex-1 py-1 text-center transition-all ${resume.settings.nameSize === size ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                                            >
                                                <span className="text-[9px] font-bold">{size}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-end pb-0.5">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={resume.settings.nameBold !== false} onChange={(e) => updateSettings({ nameBold: e.target.checked })} className="accent-indigo-500 rounded" />
                                        <span className="text-[10px] text-gray-300">Bold Name</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 block mb-1">Font</span>
                                <div className="flex bg-white/10 rounded overflow-hidden w-1/2">
                                    {['body', 'creative'].map(font => (
                                        <button
                                            key={font}
                                            onClick={() => updateSettings({ nameFont: font })}
                                            className={`flex-1 py-1 text-center transition-all ${resume.settings.nameFont === font ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                                        >
                                            <span className="text-[9px] capitalize">{font}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                            <h3 className="text-gray-300 font-bold mb-3 text-[11px]">Professional Title Settings</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] text-gray-500 block mb-1">Position</span>
                                    <div className="flex bg-white/10 rounded overflow-hidden">
                                        {[{ id: 'sameLine', label: 'Same Line' }, { id: 'below', label: 'Below' }].map(pos => (
                                            <button
                                                key={pos.id}
                                                onClick={() => updateSettings({ titlePosition: pos.id })}
                                                className={`flex-1 py-1 text-center transition-all ${resume.settings.titlePosition === pos.id ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                                            >
                                                <span className="text-[9px]">{pos.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 block mb-1">Style</span>
                                    <div className="flex bg-white/10 rounded overflow-hidden">
                                        {['normal', 'italic'].map(st => (
                                            <button
                                                key={st}
                                                onClick={() => updateSettings({ titleStyle: st })}
                                                className={`flex-1 py-1 text-center transition-all ${resume.settings.titleStyle === st ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                                            >
                                                <span className="text-[9px] capitalize">{st}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-gray-300 font-bold text-[11px] flex items-center">
                                    Photo Settings
                                    <label className="ml-4 flex items-center space-x-1 cursor-pointer">
                                        <input type="checkbox" checked={resume.settings.showPhoto !== false} onChange={(e) => updateSettings({ showPhoto: e.target.checked })} className="accent-indigo-500 rounded" />
                                        <span className="text-[9px] text-gray-400 font-normal">Show</span>
                                    </label>
                                </h3>
                            </div>
                            <div className={`transition-opacity ${resume.settings.showPhoto !== false ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <span className="text-[10px] text-gray-500 block mb-1 flex justify-between">
                                            Size <span>{resume.settings.photoSize || 80}pt</span>
                                        </span>
                                        <input type="range" min="40" max="150" step="5" value={resume.settings.photoSize || 80} onChange={(e) => updateSettings({ photoSize: parseInt(e.target.value) })} className="w-full accent-indigo-500" />
                                    </div>
                                    <div className="flex flex-col justify-end pb-0.5">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" checked={resume.settings.photoGrayscale} onChange={(e) => updateSettings({ photoGrayscale: e.target.checked })} className="accent-indigo-500 rounded" />
                                            <span className="text-[10px] text-gray-300">Grayscale</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 block mb-1">Shape</span>
                                    <div className="flex bg-white/10 rounded overflow-hidden">
                                        {['square', 'squircle', 'rounded', 'circle'].map(shape => (
                                            <button
                                                key={shape}
                                                onClick={() => updateSettings({ photoShape: shape })}
                                                className={`flex-1 py-1 text-center transition-all ${resume.settings.photoShape === shape ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                                            >
                                                <span className="text-[9px] capitalize">{shape}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-indigo-400 font-bold mb-3">Skills Display</h3>
                            <div className="flex flex-wrap gap-2">
                                {['none', 'bullet', 'hyphen'].map(style => (
                                    <button
                                        key={style}
                                        onClick={() => updateSettings({ skillsStyle: style })}
                                        className={`px-3 py-2 rounded-lg border transition-all text-center capitalize ${resume.settings.skillsStyle === style ? 'bg-indigo-600 border-indigo-400 shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-[11px] font-bold">{style}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {activeTab === 'education' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {(resume.education || []).map(edu => (
                        <div key={edu.id} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                            <div className="flex justify-between items-center">
                                <input value={edu.degree} onChange={(e) => updateArrayItem('education', edu.id, { degree: e.target.value })} placeholder="Degree" className="bg-transparent border-none text-sm font-bold text-white focus:outline-none w-full" />
                                <button onClick={() => deleteArrayItem('education', edu.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                            </div>
                            <input value={edu.school} onChange={(e) => updateArrayItem('education', edu.id, { school: e.target.value })} placeholder="University/School" className="w-full bg-transparent border-none text-xs text-gray-300 focus:outline-none" />
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <input value={edu.date} onChange={(e) => updateArrayItem('education', edu.id, { date: e.target.value })} placeholder="Date Range" className="bg-transparent border-none text-indigo-400 focus:outline-none" />
                                <input value={edu.location} onChange={(e) => updateArrayItem('education', edu.id, { location: e.target.value })} placeholder="Location" className="bg-transparent border-none text-gray-500 text-right focus:outline-none" />
                            </div>
                            <input value={edu.cgpa} onChange={(e) => updateArrayItem('education', edu.id, { cgpa: e.target.value })} placeholder="CGPA" className="w-full bg-transparent border-none text-xs text-gray-400 focus:outline-none" />
                        </div>
                    ))}
                    <button onClick={() => addArrayItem('education', { degree: '', school: '', date: '', location: '', cgpa: '' })} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-gray-400 text-xs hover:border-indigo-500 hover:text-white transition-colors flex items-center justify-center">
                        <Plus className="mr-2" size={14} /> Add Education
                    </button>
                </div>
            )}

            {activeTab === 'certs' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {(resume.certifications || []).map(cert => (
                        <div key={cert.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                            <input value={cert.name} onChange={(e) => updateArrayItem('certifications', cert.id, { name: e.target.value })} placeholder="Certification Name" className="bg-transparent border-none text-xs text-white focus:outline-none w-full" />
                            <button onClick={() => deleteArrayItem('certifications', cert.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                        </div>
                    ))}
                    <button onClick={() => addArrayItem('certifications', { name: '' })} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-gray-400 text-xs hover:border-indigo-500 hover:text-white transition-colors flex items-center justify-center">
                        <Plus className="mr-2" size={14} /> Add Certification
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResumeForm;
