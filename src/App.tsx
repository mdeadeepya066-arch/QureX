import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Database, Award, BookOpen, Layers, Menu, X, ArrowUpRight, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { Patient, DiseasePriority, ResearchTeam, TrainingJob, Molecule, CandidateDrug } from './types';

// Import sub-components
import LandingPage from './components/LandingPage';
import PatientPortal from './components/PatientPortal';
import DiseaseIntelligence from './components/DiseaseIntelligence';
import ResearchMarketplace from './components/ResearchMarketplace';
import ReviewAndComparison from './components/ReviewAndComparison';
import WorkflowCanvas from './components/WorkflowCanvas';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Consolidated server-side states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [diseases, setDiseases] = useState<DiseasePriority[]>([]);
  const [teams, setTeams] = useState<ResearchTeam[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [candidates, setCandidates] = useState<CandidateDrug[]>([]);
  const [serverConfig, setServerConfig] = useState<any>({ hasGeminiKey: false, demoMode: true });

  // Initial data hydration
  const fetchData = async () => {
    try {
      const [pRes, dRes, tRes, jRes, mRes, cRes, configRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/diseases'),
        fetch('/api/workspaces'),
        fetch('/api/training-jobs'),
        fetch('/api/molecules'),
        fetch('/api/candidates'),
        fetch('/api/config')
      ]);

      if (pRes.ok) setPatients(await pRes.json());
      if (dRes.ok) setDiseases(await dRes.json());
      if (tRes.ok) setTeams(await tRes.json());
      if (jRes.ok) setTrainingJobs(await jRes.json());
      if (mRes.ok) setMolecules(await mRes.json());
      if (cRes.ok) setCandidates(await cRes.json());
      if (configRes.ok) setServerConfig(await configRes.json());
    } catch (err) {
      console.error('Error synchronizing with Express backend:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup background polling to auto-update progress loops (simulation timers)
    const interval = setInterval(() => {
      fetchData();
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Handlers to push additions directly to backend and trigger immediate fetch
  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  const handleAddTeam = (newTeam: ResearchTeam) => {
    setTeams(prev => [...prev, newTeam]);
  };

  const handleAddNote = (teamId: string, noteText: string, updatedTimeline: any[]) => {
    setTeams(prev => prev.map(t => t.id === teamId ? {
      ...t,
      notes: [...t.notes, noteText],
      activityTimeline: updatedTimeline
    } : t));
  };

  const handleStartTrainingJob = (newJob: TrainingJob) => {
    setTrainingJobs(prev => [newJob, ...prev]);
  };

  const handleGenerateMolecules = (newMols: Molecule[]) => {
    setMolecules(prev => [...newMols, ...prev]);
  };

  const handleQueueSimulation = async (moleculeId: string) => {
    // Optimistic status update
    setMolecules(prev => prev.map(m => m.id === moleculeId ? { ...m, status: 'Running' } : m));
    try {
      const res = await fetch('/api/molecules/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moleculeId })
      });
      if (res.ok) {
        fetchData(); // pull complete simulated metrics
      }
    } catch (err) {
      console.error('Simulation triggering error:', err);
    }
  };

  const handleVoteCandidate = async (candidateId: string, expertName: string, vote: string, commentText: string) => {
    try {
      const res = await fetch('/api/candidates/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, expertName, vote, commentText })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Voting registration error:', err);
    }
  };

  const navigationItems = [
    { id: 'landing', label: 'Overview' },
    { id: 'portal', label: 'Patient Portal' },
    { id: 'disease', label: 'Disease Intelligence' },
    { id: 'marketplace', label: 'Research Workspaces' },
    { id: 'synergy', label: 'Synergy Review Board' },
    { id: 'workflow', label: 'Workflow Visualizer' }
  ];

  return (
    <div className="flex h-screen w-screen bg-[#0b0e14] text-slate-200 font-sans overflow-hidden border-none select-none">
      {/* Sidebar navigation for desktop */}
      <aside className="hidden md:flex w-64 bg-[#11151c] border-r border-slate-800/50 flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">QureX</h1>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 py-2">Discovery Pipeline</div>
          {navigationItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-md text-left transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_10px_rgba(37,99,235,0.1)] font-bold' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-400' : 'bg-slate-600'}`}></div>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <div className="bg-[#161b22] rounded-lg p-3 border border-slate-800">
            <div className="text-[10px] text-slate-500 mb-1 font-mono">QUBIT UTILIZATION</div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[72%]"></div>
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-mono">
              <span>72% ACTIVE</span>
              <span>12.4ms LATENCY</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e293b,transparent)] pointer-events-none opacity-40"></div>
        
        {/* Header bar */}
        <header className="h-14 border-b border-slate-800/50 bg-[#11151c]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Projects</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-500">ALS-Research</span>
            <span className="text-slate-700">/</span>
            <span className="text-white font-medium uppercase tracking-widest text-[10px]">
              {navigationItems.find(item => item.id === currentPage)?.label || 'Overview'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-400 border border-slate-700">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>GCP Connected</span>
            </div>

            {serverConfig.hasGeminiKey ? (
              <span className="hidden lg:inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Gemini 3.5 Live Active
              </span>
            ) : (
              <span className="hidden lg:inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Demo-Simulation Active
              </span>
            )}

            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] text-emerald-500 font-bold tracking-tighter uppercase">SYSTEMS READY</span>
            </div>
            
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">JD</div>
          </div>
        </header>

        {/* Mobile menu navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800/50 bg-[#11151c] px-4 py-3 space-y-1 z-20 shadow-xl">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold block transition-all ${
                  currentPage === item.id
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Workspace body */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 z-10">
          <div id="qurex-active-workspace-panel" className="max-w-7xl mx-auto w-full">
            {currentPage === 'landing' && (
              <LandingPage
                onNavigate={(page) => setCurrentPage(page)}
              />
            )}

            {currentPage === 'portal' && (
              <PatientPortal
                onAddPatient={handleAddPatient}
                patients={patients}
                hasGeminiKey={serverConfig.hasGeminiKey}
              />
            )}

            {currentPage === 'disease' && (
              <DiseaseIntelligence
                diseases={diseases}
                patients={patients}
                onNavigate={(page) => setCurrentPage(page)}
              />
            )}

            {currentPage === 'marketplace' && (
              <ResearchMarketplace
                diseases={diseases}
                teams={teams}
                patients={patients}
                trainingJobs={trainingJobs}
                molecules={molecules}
                onAddTeam={handleAddTeam}
                onAddNote={handleAddNote}
                onStartJob={handleStartTrainingJob}
                onGenerateMolecules={handleGenerateMolecules}
                onQueueSimulation={handleQueueSimulation}
              />
            )}

            {currentPage === 'synergy' && (
              <ReviewAndComparison
                candidates={candidates}
                diseases={diseases}
                onVoteCandidate={handleVoteCandidate}
              />
            )}

            {currentPage === 'workflow' && (
              <WorkflowCanvas />
            )}
          </div>
        </main>

        {/* Footer info bar */}
        <footer className="h-12 border-t border-slate-800/50 bg-[#11151c]/50 flex items-center px-6 md:px-8 justify-between z-10 shrink-0">
          <div className="flex gap-4 md:gap-6 text-[9px] text-slate-500 font-mono">
            <span>CLUSTER: <span className="text-slate-300">NORTH-AMERICA-1</span></span>
            <span>NODE: <span className="text-slate-300">QM-CORE-82</span></span>
            <span>API STATUS: <span className="text-emerald-500">ACTIVE</span></span>
          </div>
          <div className="text-[9px] text-slate-500 font-medium tracking-tight uppercase">
            &copy; {new Date().getFullYear()} QureX Global Discovery • Confidential
          </div>
        </footer>
      </div>
    </div>
  );
}
