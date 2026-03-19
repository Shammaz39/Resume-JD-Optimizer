import React, { useMemo } from 'react';
import { useResume } from '../context/ResumeContext';
import { Download, CheckCircle, FileText } from 'lucide-react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import ResumePDF from './ResumePDF';

const ResumePreview = () => {
    const { resume, baseResumeSnapshot, resetToSnapshot, updateSettings } = useResume();

    // Memoize the document to prevent unnecessary re-renders of the heavy PDF engine
    const pdfDocument = useMemo(() => <ResumePDF resume={resume} />, [resume]);

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-4 bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center">
                        <CheckCircle size={18} className="mr-2 text-indigo-400" /> True WYSIWYG Preview
                    </h2>
                    <p className="text-xs text-gray-400">Live @react-pdf rendering</p>
                </div>
                <div className="flex space-x-3">
                    {baseResumeSnapshot && (
                        <button onClick={resetToSnapshot} className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/20 border border-white/10 transition-all">Reset Base</button>
                    )}
                    <div className="flex items-center space-x-2 mr-2">
                        <FileText size={14} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Custom File Name..."
                            value={resume.settings?.pdfFileName || ''}
                            onChange={(e) => updateSettings({ pdfFileName: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 w-32"
                        />
                    </div>
                    <PDFDownloadLink
                        document={pdfDocument}
                        fileName={`${resume.settings?.pdfFileName || resume.personalInfo?.name || 'Resume'}.pdf`}
                        className="flex items-center space-x-2 px-4 py-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-all text-xs font-bold shadow-lg min-w-[140px] justify-center"
                    >
                        {({ loading }) => loading ? 'Building PDF...' : 'Download PDF'}
                    </PDFDownloadLink>
                </div>
            </div>

            {/* True WYSIWYG Preview Area */}
            <div className="w-full rounded-xl shadow-inner border border-white/10 bg-white overflow-hidden" style={{ height: '1122px' }}>
                <PDFViewer style={{ width: '100%', height: '1122px', border: 'none' }}>
                    {pdfDocument}
                </PDFViewer>
            </div>
        </div>
    );
};

export default ResumePreview;
