import React from 'react'
import { ResumeProvider } from './context/ResumeContext'
import ResumeForm from './components/ResumeForm'
import JDInput from './components/JDInput'
import Analysis from './components/Analysis'
import ResumePreview from './components/ResumePreview'
import { Sparkles } from 'lucide-react'

function App() {
  return (
    <ResumeProvider>
      <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
        </div>

        <header className="relative z-10 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
                Resume JD <span className="text-indigo-400">Optimizer</span>
              </h1>
            </div>
            <div className="text-sm font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              v1.0 • Local Only
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-4 space-y-8">
              <ResumeForm />
              <JDInput />
              <Analysis />
            </div>

            {/* Right Column: Preview */}
            <div className="lg:col-span-8">
              <div className="sticky top-24" style={{ minHeight: '1122px' }}>
                <ResumePreview />
              </div>
            </div>
          </div>
        </main>

        <footer className="relative z-10 border-t border-white/5 py-10 mt-20 opacity-50">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm">
            <p>&copy; 2026 Resume JD Optimizer. Built for visual excellence and privacy.</p>
          </div>
        </footer>
      </div>
    </ResumeProvider>
  )
}

export default App
