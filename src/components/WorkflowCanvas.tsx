import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Activity, RefreshCw, Layers, CheckCircle, HelpCircle, Eye } from 'lucide-react';

interface WorkflowNode {
  id: string;
  label: string;
  category: 'Ingestion' | 'Database' | 'Intelligence' | 'Simulation' | 'Consensus' | 'Outside';
  desc: string;
  system: string;
  state: 'complete' | 'active' | 'outside';
}

export default function WorkflowCanvas() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeNodeIndex, setActiveNodeIndex] = useState(2);

  const workflow: WorkflowNode[] = [
    { id: '1', label: 'PATIENTS COHORTS', category: 'Ingestion', desc: 'Anonymized medical histories, MRI reports, and blood profiles.', system: 'Cloud Storage', state: 'complete' },
    { id: '2', label: 'SECURE UPLOAD', category: 'Ingestion', desc: 'HIPAA-compliant document parsing and secure queue storage.', system: 'GCS Buckets', state: 'complete' },
    { id: '3', label: 'AI EXTRACTION', category: 'Ingestion', desc: 'Gemini models map raw records into structured database schemas.', system: 'Gemini API', state: 'active' },
    { id: '4', label: 'STRUCTURED DATABASE', category: 'Database', desc: 'Replicated, query-optimized multi-omics bio-indexes.', system: 'Cloud SQL PG', state: 'complete' },
    { id: '5', label: 'DISEASE INTELLIGENCE', category: 'Intelligence', desc: 'Mutational frequencies and cohort cluster visualizations.', system: 'Vertex AI / BigQuery', state: 'complete' },
    { id: '6', label: 'RESEARCH PRIORITY', category: 'Intelligence', desc: 'Standardized gap index leaderboard pointing to urgent needs.', system: 'Looker Analytics', state: 'complete' },
    { id: '7', label: 'RESEARCH MARKETPLACE', category: 'Simulation', desc: 'Portal where parallel international labs coordinate targets.', system: 'QureX Registry', state: 'complete' },
    { id: '8', label: 'TEAM WORKSPACES', category: 'Simulation', desc: 'Isolated sandbox containers with unique active notes & members.', system: 'Cloud Run Orchestrator', state: 'complete' },
    { id: '9', label: 'VERTEX AI ENGINES', category: 'Simulation', desc: 'Google Cloud high-performance compute instances scheduling GNNs.', system: 'Vertex Pipelines', state: 'complete' },
    { id: '10', label: 'AI MODELS', category: 'Simulation', desc: 'Graph Neural Networks and Chemical Transformer sequence weights.', system: 'TensorFlow / PyTorch', state: 'complete' },
    { id: '11', label: 'MOLECULE GENERATION', category: 'Simulation', desc: 'Generative design inventing candidate SMILES coordinates.', system: 'Gemini Generative Chem', state: 'complete' },
    { id: '12', label: 'QUANTUM SIMULATION', category: 'Simulation', desc: 'Simulating electronic orbital overlaps and binding affinity energies.', system: 'Google Quantum Core', state: 'complete' },
    { id: '13', label: 'RESEARCH COMPARISON', category: 'Consensus', desc: 'Performance bar matrix comparing parallel teams side by side.', system: 'Comparison Matrix', state: 'complete' },
    { id: '14', label: 'EXPERT REVIEW', category: 'Consensus', desc: 'Human-in-the-loop consensus voting and safety audits.', system: 'Synergy Review Board', state: 'complete' },
    { id: '15', label: 'WET LAB VALIDATION', category: 'Outside', desc: 'In-vitro synthesis, crystallization, and cell-culture assays.', system: 'Biological Wet Lab', state: 'outside' },
    { id: '16', label: 'ANIMAL STUDIES', category: 'Outside', desc: 'In-vivo pharmacokinetic absorption and metabolic toxicity profiles.', system: 'Preclinical Trials', state: 'outside' },
    { id: '17', label: 'CLINICAL TRIALS (I-III)', category: 'Outside', desc: 'Human safety trials (Phase I) and efficacy checks (Phase II/III).', system: 'Research Hospital Clinics', state: 'outside' },
    { id: '18', label: 'REGULATORY APPROVAL', category: 'Outside', desc: 'FDA/EMA approval and production deployment for patient use.', system: 'Federal FDA Portal', state: 'outside' }
  ];

  // Rotate active node in pipeline to showcase flow
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveNodeIndex(prev => (prev + 1) % workflow.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="space-y-8">
      {/* Controls panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11151c] border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">End-to-End Pipeline Workflow</h2>
          <p className="text-xs text-slate-400">Continuous monitoring of the drug discovery lifecycle, mapping AI models to final regulatory reviews.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_12px_rgba(37,99,235,0.3)]"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white" />}
            {isPlaying ? 'Pause Simulation' : 'Resume Flow'}
          </button>
          <button
            onClick={() => setActiveNodeIndex(2)}
            className="p-2 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 cursor-pointer transition-all"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Grid Cascading Node Map */}
      <div id="workflow-nodes-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
        {workflow.map((node, index) => {
          const isActive = index === activeNodeIndex;
          return (
            <div
              key={node.id}
              className={`relative bg-[#161b22] border rounded-2xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between h-44 ${
                isActive ? 'border-blue-500 ring-2 ring-blue-500/20 scale-102 shadow-[0_0_20px_rgba(37,99,235,0.15)]' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Connector line overlay */}
              {index < workflow.length - 1 && (
                <div className="hidden lg:block absolute -right-3.5 top-1/2 w-4 h-[1px] bg-slate-800 z-0" />
              )}

              <div className="space-y-2 relative z-10">
                <div className="flex justify-between items-center">
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${
                    node.category === 'Ingestion' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    node.category === 'Database' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    node.category === 'Intelligence' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                    node.category === 'Simulation' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                    node.category === 'Consensus' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {node.category}
                  </span>
                  
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500 font-bold">
                    <span>NODE {node.id}</span>
                    {node.state === 'complete' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                    {node.state === 'outside' && <HelpCircle className="w-3.5 h-3.5 text-slate-600" />}
                    {isActive && <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />}
                  </div>
                </div>

                <h4 className="font-bold text-white text-sm leading-tight">{node.label}</h4>
                <p className="text-[10px] text-slate-400 leading-normal font-sans">{node.desc}</p>
              </div>

              {/* Footer row system */}
              <div className="pt-2 border-t border-slate-850 flex justify-between items-center relative z-10 text-[9px] font-mono">
                <span className="text-slate-500 font-bold uppercase">System Link:</span>
                <span className="font-bold text-slate-300">{node.system}</span>
              </div>

              {/* Animated pulse dot */}
              {isActive && (
                <div className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
