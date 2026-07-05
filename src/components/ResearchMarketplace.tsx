import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, BookOpen, Users, FolderCheck, Plus, ChevronLeft, Send, Sparkles, Database, Code, ShieldAlert, Cpu, Layers } from 'lucide-react';
import { DiseasePriority, ResearchTeam, Patient, TrainingJob, Molecule } from '../types';

// Ingest sub-tabs
import { AIDatasetBuilder, AITrainingPipeline, MoleculeGenerationDashboard, QuantumSimulationDashboard } from './PipelineComponents';

interface ResearchMarketplaceProps {
  diseases: DiseasePriority[];
  teams: ResearchTeam[];
  patients: Patient[];
  trainingJobs: TrainingJob[];
  molecules: Molecule[];
  onAddTeam: (newTeam: ResearchTeam) => void;
  onAddNote: (teamId: string, note: string, timeline: any[]) => void;
  onStartJob: (job: TrainingJob) => void;
  onGenerateMolecules: (newMols: Molecule[]) => void;
  onQueueSimulation: (moleculeId: string) => void;
}

type ActiveTab = 'dataset' | 'model' | 'molecules' | 'quantum';

export default function ResearchMarketplace({
  diseases,
  teams,
  patients,
  trainingJobs,
  molecules,
  onAddTeam,
  onAddNote,
  onStartJob,
  onGenerateMolecules,
  onQueueSimulation
}: ResearchMarketplaceProps) {
  // Navigation states
  const [activeTeam, setActiveTeam] = useState<ResearchTeam | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dataset');

  // New Team Workspace Creator Form states
  const [selectedDiseaseForNewTeam, setSelectedDiseaseForNewTeam] = useState<DiseasePriority | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDataset, setNewTeamDataset] = useState('Standard Genomic Cohort v1');
  const [newTeamLead, setNewTeamLead] = useState('');
  const [newTeamNote, setNewTeamNote] = useState('');

  // Local state for active workspace notes
  const [newNoteInput, setNewNoteInput] = useState('');

  // Filter teams by disease
  const getTeamsForDisease = (diseaseId: string) => teams.filter(t => t.diseaseId === diseaseId);

  // Return molecules designed by team
  const getMoleculesForTeam = (teamId: string) => molecules.filter(m => m.teamId === teamId);

  // Handle Workspace creation
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !selectedDiseaseForNewTeam) return;

    try {
      const res = await fetch('/api/workspaces/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: newTeamName,
          diseaseId: selectedDiseaseForNewTeam.id,
          selectedDataset: newTeamDataset,
          collaborators: [newTeamLead || 'Dr. Scientist', 'Vertex AI Copilot'],
          initialNotes: newTeamNote || 'Workspace initiated for dynamic ligand screening.'
        })
      });
      if (!res.ok) throw new Error('Failed to create team workspace.');
      const team = await res.json();
      onAddTeam(team);
      setActiveTeam(team);
      setSelectedDiseaseForNewTeam(null);
      setNewTeamName('');
      setNewTeamLead('');
      setNewTeamNote('');
    } catch (err) {
      console.error(err);
    }
  };

  // Submit dynamic note
  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim() || !activeTeam) return;

    try {
      const res = await fetch('/api/workspaces/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: activeTeam.id,
          noteText: newNoteInput
        })
      });
      if (!res.ok) throw new Error('Note submission failed.');
      const data = await res.json();
      onAddNote(activeTeam.id, newNoteInput, data.timeline);
      
      // Update local activeTeam timeline to re-render notes
      setActiveTeam({
        ...activeTeam,
        notes: [...activeTeam.notes, newNoteInput],
        activityTimeline: data.timeline
      });
      setNewNoteInput('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {/* VIEW 1: RESEARCH MARKETPLACE */}
        {!activeTeam ? (
          <motion.div
            key="marketplace-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Research Workspace Marketplace</h2>
              <p className="text-sm text-slate-400">
                Explore priorities. Spin up parallel, isolated workspaces to search for targeted therapeutic molecules.
              </p>
            </div>

            {/* Disease cards list */}
            <div id="disease-marketplace-list" className="grid grid-cols-1 gap-6">
              {diseases.map((dis) => {
                const diseaseTeams = getTeamsForDisease(dis.id);
                return (
                  <div key={dis.id} className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all space-y-6">
                    {/* Header bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] bg-slate-800 border border-slate-700/50 text-slate-400 font-bold px-2 py-0.5 rounded uppercase">Category: {dis.category}</span>
                        <h3 className="text-xl font-bold text-white">{dis.name}</h3>
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{dis.researchGap}</p>
                      </div>

                      <div className="flex items-center gap-4 text-center">
                        <div className="px-3">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Priority Index</span>
                          <span className="text-2xl font-extrabold text-indigo-400 font-mono">{dis.priorityScore}</span>
                        </div>
                        <div className="px-3 border-l border-slate-800">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Parallel Teams</span>
                          <span className="text-2xl font-extrabold text-slate-200 font-mono">{diseaseTeams.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Workspaces block */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Active Target Workspaces</span>
                        <button
                          onClick={() => setSelectedDiseaseForNewTeam(dis)}
                          className="px-2.5 py-1 text-[10px] bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-400 text-indigo-400 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Plus className="w-3 h-3" /> Create Workspace
                        </button>
                      </div>

                      {diseaseTeams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {diseaseTeams.map((team) => {
                            const teamMoleculesCount = getMoleculesForTeam(team.id).length;
                            return (
                              <div key={team.id} className="p-4 bg-[#0b0e14]/60 border border-slate-850 rounded-2xl hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between">
                                <div className="space-y-1.5">
                                  <h4 className="font-bold text-slate-200 text-sm">{team.teamName}</h4>
                                  <div className="flex flex-wrap gap-1">
                                    <span className="text-[9px] bg-[#11151c] border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">Dataset: {team.selectedDataset.substring(0, 18)}...</span>
                                    <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold font-mono">{teamMoleculesCount} Designed</span>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-slate-850">
                                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" /> {team.collaborators.length} Members
                                  </span>
                                  <button
                                    id={`btn-join-team-${team.id}`}
                                    onClick={() => setActiveTeam(team)}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-[0_0_12px_rgba(37,99,235,0.2)]"
                                  >
                                    Join Workspace
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                          No active workspaces currently analyzing this disease context.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CREATOR WORKSPACE MODAL POPUP (EMBEDDED) */}
            {selectedDiseaseForNewTeam && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-md">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Configure Workspace</h3>
                    <p className="text-xs text-slate-400">Initialize a new secure, isolated environment targeting <span className="font-bold text-slate-300">{selectedDiseaseForNewTeam.name}</span>.</p>
                  </div>

                  <form onSubmit={handleCreateTeam} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Research Team / Guild Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Stanford Neuro-Therapeutics"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="w-full border border-slate-850 bg-[#0b0e14] text-white p-2.5 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Initial Core Dataset</label>
                      <select
                        value={newTeamDataset}
                        onChange={(e) => setNewTeamDataset(e.target.value)}
                        className="w-full border border-slate-850 bg-[#0b0e14] text-white p-2.5 rounded-xl focus:outline-hidden focus:border-blue-500 transition-colors"
                      >
                        <option value="Severe ALS Patient Cohort v2">Severe ALS Patient Cohort v2</option>
                        <option value="EGFRvIII Positive Glioblastoma Cohort">EGFRvIII Positive Glioblastoma Cohort</option>
                        <option value="APOE4/e4 Alzheimers Patient Registry">APOE4/e4 Alzheimers Patient Registry</option>
                        <option value="Generic Biome Multi-omics Set">Generic Biome Multi-omics Set</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Lead Collaborator / PI</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Jane Goodall"
                        value={newTeamLead}
                        onChange={(e) => setNewTeamLead(e.target.value)}
                        className="w-full border border-slate-850 bg-[#0b0e14] text-white p-2.5 rounded-xl focus:outline-hidden focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Initial Research Objectives</label>
                      <textarea
                        placeholder="Focusing on G-quadruplex molecular binders to halt C9orf72 translation pathways..."
                        rows={3}
                        value={newTeamNote}
                        onChange={(e) => setNewTeamNote(e.target.value)}
                        className="w-full border border-slate-850 bg-[#0b0e14] text-white p-2.5 rounded-xl focus:outline-hidden focus:border-blue-500 font-sans transition-colors"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDiseaseForNewTeam(null)}
                        className="flex-1 py-2.5 border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800/40 rounded-xl cursor-pointer font-semibold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        id="btn-confirm-create-workspace"
                        type="submit"
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                      >
                        Launch
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </motion.div>
        ) : (
          /* VIEW 2: TEAM WORKSPACE CONSOLE */
          <motion.div
            key="workspace-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11151c] text-white p-5 rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
              
              <div className="space-y-1 relative z-10">
                <button
                  id="btn-back-to-marketplace"
                  onClick={() => setActiveTeam(null)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 mb-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Exit to Marketplace
                </button>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{activeTeam.teamName}</h2>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">Workspace Active</span>
                </div>
                <p className="text-xs text-slate-400">
                  Disease context: <span className="font-bold text-slate-200">{diseases.find(d => d.id === activeTeam.diseaseId)?.name}</span>
                </p>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 gap-4 relative z-10 text-center text-xs font-mono">
                <div className="p-2.5 bg-[#161b22] border border-slate-850 rounded-xl">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Molecules designed</span>
                  <span className="text-sm font-extrabold text-emerald-400">{getMoleculesForTeam(activeTeam.id).length} Compounds</span>
                </div>
                <div className="p-2.5 bg-[#161b22] border border-slate-850 rounded-xl">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Active Dataset</span>
                  <span className="text-sm font-extrabold text-blue-400 truncate block max-w-32">{activeTeam.selectedDataset}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left sidebar info (collaborators, activity logs, notes) */}
              <div className="xl:col-span-3 space-y-6">
                {/* Notes box */}
                <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" /> Research Notes
                  </h4>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {activeTeam.notes.map((note, idx) => (
                      <div key={idx} className="p-3 bg-[#0b0e14] rounded-xl border border-slate-850 text-[11px] text-slate-300 leading-normal relative">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full absolute left-2 top-3" />
                        <p className="pl-3 font-sans font-medium">{note}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSubmitNote} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add note to team..."
                      value={newNoteInput}
                      onChange={(e) => setNewNoteInput(e.target.value)}
                      className="flex-1 border border-slate-850 bg-[#0b0e14] text-white p-2 text-[11px] rounded-xl focus:outline-hidden focus:border-blue-500 transition-colors"
                    />
                    <button
                      id="btn-add-note"
                      type="submit"
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer transition-all shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* Team Collaborators */}
                <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" /> Research Members
                  </h4>
                  <div className="space-y-2 text-xs">
                    {activeTeam.collaborators.map((col, idx) => (
                      <div key={idx} className="flex items-center gap-2 font-medium text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center uppercase">{col.substring(0, 2)}</div>
                        <span>{col}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Timeline logs */}
                <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <FolderCheck className="w-4 h-4 text-slate-400" /> Workspace Log
                  </h4>
                  <div className="space-y-3 text-[10px] font-mono leading-normal max-h-48 overflow-y-auto pr-1">
                    {activeTeam.activityTimeline.map((time, idx) => (
                      <div key={idx} className="border-l border-slate-800 pl-3 relative space-y-0.5">
                        <span className="w-1.5 h-1.5 bg-slate-600 rounded-full absolute -left-[4px] top-1" />
                        <div className="text-slate-500">{new Date(time.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {time.user}</div>
                        <div className="font-bold text-slate-300">{time.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right core panels (the 4 sub-tabs) */}
              <div className="xl:col-span-9 space-y-6">
                {/* Tab Navigation header resembling Google Cloud */}
                <div className="flex border-b border-slate-800 text-xs font-semibold text-slate-400 flex-wrap gap-1">
                  <button
                    id="tab-dataset-builder"
                    onClick={() => setActiveTab('dataset')}
                    className={`px-4 py-2.5 flex items-center gap-2 transition-all border-b-2 hover:text-slate-200 cursor-pointer ${
                      activeTab === 'dataset' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" /> AI Dataset Builder
                  </button>
                  <button
                    id="tab-model-pipeline"
                    onClick={() => setActiveTab('model')}
                    className={`px-4 py-2.5 flex items-center gap-2 transition-all border-b-2 hover:text-slate-200 cursor-pointer ${
                      activeTab === 'model' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" /> AI Training Pipeline
                  </button>
                  <button
                    id="tab-molecules"
                    onClick={() => setActiveTab('molecules')}
                    className={`px-4 py-2.5 flex items-center gap-2 transition-all border-b-2 hover:text-slate-200 cursor-pointer ${
                      activeTab === 'molecules' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" /> Generative Molecules
                  </button>
                  <button
                    id="tab-quantum"
                    onClick={() => setActiveTab('quantum')}
                    className={`px-4 py-2.5 flex items-center gap-2 transition-all border-b-2 hover:text-slate-200 cursor-pointer ${
                      activeTab === 'quantum' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Quantum Simulation
                  </button>
                </div>

                {/* Sub Tab contents */}
                <div>
                  {activeTab === 'dataset' && (
                    <AIDatasetBuilder
                      currentDataset={activeTeam.selectedDataset}
                      onDatasetSelected={(datasetName) => {
                        // Mutate selected dataset
                        activeTeam.selectedDataset = datasetName;
                        // Add timeline action
                        activeTeam.activityTimeline.unshift({
                          timestamp: new Date().toISOString(),
                          action: `Re-compiled target Dataset: ${datasetName.split(' ')[0]}`,
                          user: 'Vertex compiler'
                        });
                      }}
                    />
                  )}

                  {activeTab === 'model' && (
                    <AITrainingPipeline
                      teamId={activeTeam.id}
                      trainingJobs={trainingJobs}
                      onStartJob={(job) => {
                        onStartJob(job);
                        activeTeam.activityTimeline.unshift({
                          timestamp: new Date().toISOString(),
                          action: `Launched ${job.modelType} Pipeline`,
                          user: 'Vertex orchestrator'
                        });
                      }}
                    />
                  )}

                  {activeTab === 'molecules' && (
                    <MoleculeGenerationDashboard
                      teamId={activeTeam.id}
                      molecules={molecules}
                      targetProtein="EAAT2-Pocket"
                      onGenerateMolecules={onGenerateMolecules}
                      onQueueSimulation={onQueueSimulation}
                    />
                  )}

                  {activeTab === 'quantum' && (
                    <QuantumSimulationDashboard
                      teamId={activeTeam.id}
                      molecules={molecules}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
