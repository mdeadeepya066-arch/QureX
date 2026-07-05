import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Filter, Database, Brain, Play, BarChart3, Atom, HelpCircle, CheckCircle, Flame, Plus, ChevronRight, Loader } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Patient, TrainingJob, Molecule } from '../types';

// ============================================================================
// 1. AI DATASET BUILDER
// ============================================================================
interface DatasetBuilderProps {
  onDatasetSelected: (datasetName: string) => void;
  currentDataset: string;
}

export function AIDatasetBuilder({ onDatasetSelected, currentDataset }: DatasetBuilderProps) {
  const [query, setQuery] = useState('Find patients aged 20-40 with mutation C9orf72, who responded to Riluzole');
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBuildDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsParsing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/dataset-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (!res.ok) throw new Error('Query parsing failed.');
      const data = await res.json();
      setResult(data);
      if (data.patientsCount > 0) {
        onDatasetSelected(`Gemini-derived: ${query.substring(0, 35)}... (${data.patientsCount} Cohorts)`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing AI query.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="space-y-1.5 relative z-10">
          <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Vertex AI Translation Engine
          </span>
          <h3 className="text-xl font-bold">Natural Language Cohort Compiler</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Describe your clinical criteria in native language. Gemini converts your research queries into SQL schemas to aggregate clinical & mutation biomarkers.
          </p>
        </div>

        {/* Search input bar */}
        <form onSubmit={handleBuildDataset} className="flex gap-3 relative z-10">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Find patients with KRAS G12D mutation and stage III disease..."
              className="w-full bg-slate-800 text-slate-200 pl-10 pr-4 py-3 text-xs rounded-xl focus:outline-hidden border border-slate-700 focus:border-blue-500 transition-all font-sans font-medium"
            />
          </div>
          <button
            id="btn-dataset-builder-run"
            type="submit"
            disabled={isParsing}
            className="px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isParsing ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Compile Cohort
          </button>
        </form>
      </div>

      {errorMsg && <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl">{errorMsg}</div>}

      {/* Results output mapping */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Filter outputs Summary */}
            <div className="lg:col-span-4 bg-[#161b22] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" /> Parsed Filter Nodes
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 bg-[#0b0e14] rounded-lg">
                  <span className="text-slate-500">Age Bracket</span>
                  <span className="font-bold text-slate-200">{result.filterCriteria.ageMin || 0} - {result.filterCriteria.ageMax || '120'} yrs</span>
                </div>
                <div className="flex justify-between p-2 bg-[#0b0e14] rounded-lg">
                  <span className="text-slate-500">Diagnosis Type</span>
                  <span className="font-bold text-slate-200">{result.filterCriteria.diagnosis || 'All'}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#0b0e14] rounded-lg">
                  <span className="text-slate-500">Mutation Target</span>
                  <span className="font-bold text-slate-200">{result.filterCriteria.mutation || 'All'}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#0b0e14] rounded-lg">
                  <span className="text-slate-500">Disease Staging</span>
                  <span className="font-bold text-slate-200">{result.filterCriteria.stage || 'All'}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1">
                <div className="text-xs font-bold text-blue-400">Dynamic Ingestion Active</div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  This cohort has been injected as the active target dataset for your team workspace models.
                </p>
              </div>
            </div>

            {/* Matched patients list */}
            <div className="lg:col-span-8 bg-[#161b22] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" /> Compiled Cohorts ({result.patientsCount} patients matched)
                </h4>
                <span className="text-[10px] font-mono font-bold text-slate-500">Dataset size: ~{(result.patientsCount * 4.2).toFixed(1)} MB</span>
              </div>

              {result.patientsCount > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {result.selectedPatients.map((p: Patient) => (
                    <div key={p.id} className="p-3 bg-[#0b0e14] rounded-xl border border-slate-850 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-200 text-xs">{p.name}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">{p.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-1">
                        <div>Age: {p.age} | Stage: {p.diseaseStage}</div>
                        <div>Mutations: {p.geneMutations.join(', ')}</div>
                        <div className="truncate">Hospital: {p.hospital}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  No patient profiles matched your specific criteria. Try widening age caps or broadening mutation keys.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// 2. AI TRAINING PIPELINE
// ============================================================================
interface TrainingPipelineProps {
  teamId: string;
  trainingJobs: TrainingJob[];
  onStartJob: (job: TrainingJob) => void;
}

const PRESET_LOSS_CURVE = [
  { epoch: 0, loss: 1.25, valLoss: 1.42, accuracy: 0.12 },
  { epoch: 20, loss: 0.84, valLoss: 0.98, accuracy: 0.35 },
  { epoch: 40, loss: 0.52, valLoss: 0.69, accuracy: 0.58 },
  { epoch: 60, loss: 0.31, valLoss: 0.44, accuracy: 0.74 },
  { epoch: 80, loss: 0.19, valLoss: 0.28, accuracy: 0.83 },
  { epoch: 100, loss: 0.12, valLoss: 0.21, accuracy: 0.89 },
  { epoch: 120, loss: 0.08, valLoss: 0.16, accuracy: 0.93 },
  { epoch: 150, loss: 0.06, valLoss: 0.12, accuracy: 0.95 }
];

export function AITrainingPipeline({ teamId, trainingJobs, onStartJob }: TrainingPipelineProps) {
  const [modelType, setModelType] = useState<TrainingJob['modelType']>('Graph Neural Network');
  const [targetProtein, setTargetProtein] = useState('FUS-RGG-Domain');
  const [learningRate, setLearningRate] = useState('0.001');
  const [batchSize, setBatchSize] = useState('32');
  const [epochs, setEpochs] = useState('150');
  const [isTriggering, setIsTriggering] = useState(false);

  const teamJobs = trainingJobs.filter(j => j.teamId === teamId);

  const handleStartTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTriggering(true);
    try {
      const res = await fetch('/api/training-jobs/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          modelType,
          targetProtein,
          learningRate,
          batchSize,
          epochs
        })
      });
      if (!res.ok) throw new Error('Training trigger failed.');
      const data = await res.json();
      onStartJob(data.job);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Parameter Selection */}
      <div className="lg:col-span-5 bg-[#161b22] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" /> Pipeline Configuration
          </h3>
          <p className="text-xs text-slate-400">Train generative molecular models by selecting biological parameters & learning architectures.</p>
        </div>

        <form onSubmit={handleStartTraining} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-400">Model Neural Type</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value as any)}
              className="w-full text-xs border border-slate-850 bg-[#0b0e14] text-white p-2.5 rounded-xl focus:outline-hidden focus:border-blue-500 transition-colors"
            >
              <option value="Graph Neural Network">Graph Neural Network (GNN)</option>
              <option value="Transformer">Chemical Transformer (SMILES Generative)</option>
              <option value="CNN">Convolutional Neural Net (Pocket Docker)</option>
              <option value="Random Forest">Random Forest Classifier (Solubility Predictor)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-400">Target Pocket / Protein</label>
            <input
              type="text"
              value={targetProtein}
              onChange={(e) => setTargetProtein(e.target.value)}
              placeholder="e.g. EGFRvIII-Kinase-Pocket"
              className="w-full border border-slate-850 bg-[#0b0e14] text-white p-2.5 rounded-xl font-mono focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-500 block uppercase text-[9px]">Learning Rate</label>
              <input
                type="text"
                value={learningRate}
                onChange={(e) => setLearningRate(e.target.value)}
                className="w-full border border-slate-850 bg-[#0b0e14] text-white p-2 rounded-xl text-center font-mono focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500 block uppercase text-[9px]">Batch Size</label>
              <input
                type="text"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                className="w-full border border-slate-850 bg-[#0b0e14] text-white p-2 rounded-xl text-center font-mono focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500 block uppercase text-[9px]">Max Epochs</label>
              <input
                type="text"
                value={epochs}
                onChange={(e) => setEpochs(e.target.value)}
                className="w-full border border-slate-850 bg-[#0b0e14] text-white p-2 rounded-xl text-center font-mono focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            id="btn-training-pipeline-start"
            type="submit"
            disabled={isTriggering}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            <Play className="w-4 h-4 fill-white text-white" /> {isTriggering ? 'Connecting to Vertex AI...' : 'Initialize Training Job'}
          </button>
        </form>
      </div>

      {/* active Jobs & charts */}
      <div className="lg:col-span-7 bg-[#161b22] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" /> Live Loss Convergence Curve
          </h3>
          <p className="text-xs text-slate-400">Cross-entropy binding loss reduction plotted across target training epochs.</p>
        </div>

        {/* Chart */}
        <div className="h-44 text-xs font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PRESET_LOSS_CURVE} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="epoch" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#11151c', borderColor: '#334155', color: '#f1f5f9' }} />
              <Line type="monotone" dataKey="loss" stroke="#ef4444" name="Training Loss" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="valLoss" stroke="#3b82f6" name="Val Loss" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* List of active training jobs */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Vertex Pipeline Jobs</span>
          {teamJobs.length > 0 ? (
            <div id="training-jobs-list" className="space-y-3">
              {teamJobs.map((job) => (
                <div key={job.id} className="p-4 bg-[#0b0e14]/60 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-xs">{job.modelType}</span>
                      <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">{job.id}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Target Protein: {job.targetProtein} • Epochs: {job.hyperparameters.epochs}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    {job.status === 'Running' ? (
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${job.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-blue-400 animate-pulse flex items-center gap-1">
                          <Loader className="w-3 h-3 animate-spin" /> Training {job.progress}%
                        </span>
                      </div>
                    ) : (
                      <div className="text-right space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Completed
                        </span>
                        {job.metrics && (
                          <div className="text-[9px] text-slate-500 font-mono">
                            Accuracy: {job.metrics.accuracy} | F1: {job.metrics.f1Score}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No active training job sessions configured. Submit parameters on the left to activate Vertex pipelines.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. MOLECULE GENERATION
// ============================================================================
interface MoleculeGenerationProps {
  teamId: string;
  molecules: Molecule[];
  targetProtein: string;
  onGenerateMolecules: (newMols: Molecule[]) => void;
  onQueueSimulation: (moleculeId: string) => void;
}

export function MoleculeGenerationDashboard({ teamId, molecules, targetProtein, onGenerateMolecules, onQueueSimulation }: MoleculeGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [diseaseContext, setDiseaseContext] = useState('dis-als');
  const [sortParam, setSortParam] = useState<'drugLikeness' | 'noveltyScore'>('drugLikeness');

  const teamMolecules = molecules.filter(m => m.teamId === teamId).sort((a, b) => b[sortParam] - a[sortParam]);

  const handleGenerateMolecules = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/molecules/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          targetProtein,
          diseaseId: diseaseContext
        })
      });
      if (!res.ok) throw new Error('Generation failed.');
      const data = await res.json();
      onGenerateMolecules(data.molecules);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator Prompt Panel */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" /> Generative Neural Chemist
          </span>
          <h3 className="text-xl font-bold">Small-Molecule Drug Generative Arena</h3>
          <p className="text-xs text-slate-300 max-w-xl leading-normal">
            Assemble new biological compounds utilizing Gemini sequence intelligence. Set the pocket to target, compile SMILES, and queue active ligands directly into the Quantum Simulator.
          </p>
        </div>

        <div className="flex gap-3 relative z-10 self-center md:self-auto shrink-0">
          <button
            id="btn-generate-molecules"
            onClick={handleGenerateMolecules}
            disabled={isGenerating}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? <Loader className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4 text-white" />}
            {isGenerating ? 'Designing SMILES...' : 'Generate Target Candidates'}
          </button>
        </div>
      </div>

      {/* Sorting Control */}
      <div className="flex justify-between items-center bg-[#161b22] border border-slate-800 p-4 rounded-2xl shadow-xl">
        <span className="text-xs font-bold text-slate-400">Inventory: {teamMolecules.length} Generative Compounds</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <button
            onClick={() => setSortParam('drugLikeness')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              sortParam === 'drugLikeness' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            Lipinski Drug-Likeness
          </button>
          <button
            onClick={() => setSortParam('noveltyScore')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              sortParam === 'noveltyScore' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            Molecular Novelty
          </button>
        </div>
      </div>

      {/* Molecules Grid */}
      {teamMolecules.length > 0 ? (
        <div id="molecules-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMolecules.map((m) => (
            <div key={m.id} className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-white text-sm">{m.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">Formula: {m.formula}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border ${
                    m.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : m.status === 'Running' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700/50'
                  }`}>
                    {m.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Chemical SMILES</span>
                  <div className="p-2 bg-[#0b0e14] border border-slate-850/80 rounded-lg text-[9px] text-slate-300 font-mono break-all max-h-12 overflow-y-auto">
                    {m.smile}
                  </div>
                </div>

                {/* Score meters */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                  <div className="bg-[#0b0e14] p-2 rounded-xl border border-slate-850/85">
                    <span className="text-slate-500 block text-[9px]">Drug Likeness</span>
                    <span className="font-bold font-mono text-slate-200">{m.drugLikeness}%</span>
                  </div>
                  <div className="bg-[#0b0e14] p-2 rounded-xl border border-slate-850/85">
                    <span className="text-slate-500 block text-[9px]">Novelty</span>
                    <span className="font-bold font-mono text-emerald-400">{m.noveltyScore}%</span>
                  </div>
                  <div className="bg-[#0b0e14] p-2 rounded-xl border border-slate-850/85">
                    <span className="text-slate-500 block text-[9px]">Synthetic Acc</span>
                    <span className="font-bold font-mono text-slate-200">{m.syntheticAccessibility}%</span>
                  </div>
                </div>
              </div>

              {/* Action trigger quantum simulation */}
              <div className="pt-4 border-t border-slate-850 flex justify-between items-center">
                <span className="text-[9px] text-slate-500 font-semibold uppercase">Target: {m.targetProtein}</span>
                {m.status === 'Queued' ? (
                  <button
                    onClick={() => onQueueSimulation(m.id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                  >
                    <Atom className="w-3.5 h-3.5 text-white" /> Simulation Queue
                  </button>
                ) : m.status === 'Running' ? (
                  <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1 animate-pulse">
                    <Loader className="w-3 h-3 animate-spin text-blue-400" /> Simulating...
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Simulated ({m.quantumScore}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 bg-[#11151c]/40 rounded-3xl space-y-2">
          <Brain className="w-8 h-8 mx-auto text-slate-600" />
          <p className="font-bold text-slate-400">No molecules generated yet.</p>
          <p className="text-[11px] text-slate-500">Click "Generate Target Candidates" above to let the generative AI model design target compounds.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. QUANTUM SIMULATION CENTER
// ============================================================================
interface QuantumSimulationProps {
  teamId: string;
  molecules: Molecule[];
}

export function QuantumSimulationDashboard({ teamId, molecules }: QuantumSimulationProps) {
  const simulatedMolecules = molecules.filter(m => m.teamId === teamId && m.status !== 'Queued');

  return (
    <div className="space-y-6">
      <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Atom className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} /> Google Quantum Simulation Core
          </h3>
          <p className="text-xs text-slate-400">Calculates covalent binding affinities, hydrogen-bond overlap metrics, and drug-to-receptor thermal kinetic stability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-[#0b0e14] border border-slate-800 rounded-2xl text-center space-y-1 shadow-sm">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Simulated Molecules</span>
            <div className="text-3xl font-extrabold text-cyan-300">{simulatedMolecules.length}</div>
          </div>
          <div className="p-4 bg-[#0b0e14] border border-slate-800 rounded-2xl text-center space-y-1 shadow-sm">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Avg Binding Affinity</span>
            <div className="text-3xl font-extrabold text-cyan-300">
              {simulatedMolecules.filter(m => m.bindingAffinity).length > 0
                ? `${(simulatedMolecules.reduce((acc, c) => acc + (c.bindingAffinity || 0), 0) / simulatedMolecules.filter(m => m.bindingAffinity).length).toFixed(1)} kcal`
                : '-'}
            </div>
          </div>
          <div className="p-4 bg-[#0b0e14] border border-slate-800 rounded-2xl text-center space-y-1 shadow-sm">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Avg Quantum Score</span>
            <div className="text-3xl font-extrabold text-cyan-300">
              {simulatedMolecules.filter(m => m.quantumScore).length > 0
                ? `${(simulatedMolecules.reduce((acc, c) => acc + (c.quantumScore || 0), 0) / simulatedMolecules.filter(m => m.quantumScore).length).toFixed(0)}%`
                : '-'}
            </div>
          </div>
          <div className="p-4 bg-[#0b0e14] border border-slate-800 rounded-2xl text-center space-y-1 shadow-sm">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Hardware Status</span>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-center py-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              Simulator Active
            </div>
          </div>
        </div>
      </div>

      {simulatedMolecules.length > 0 ? (
        <div id="quantum-simulations-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {simulatedMolecules.map((m) => (
            <div key={m.id} className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-cyan-500/50 transition-all">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white text-sm">{m.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">Formula: {m.formula}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block uppercase">Quantum Index</span>
                  <span className="text-lg font-extrabold text-cyan-400 font-mono">
                    {m.status === 'Running' ? 'CALCULATING' : `${m.quantumScore}%`}
                  </span>
                </div>
              </div>

              {m.status === 'Running' ? (
                <div className="p-6 bg-[#0b0e14] border border-slate-850 rounded-xl text-center flex flex-col items-center justify-center space-y-3">
                  <Loader className="w-8 h-8 text-blue-400 animate-spin" />
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-200">Solving Schrödinger Wave Equation</div>
                    <p className="text-[10px] text-slate-500">Iterating orbital overlaps and electrostatic kinetics...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="p-2.5 bg-[#0b0e14] rounded-xl border border-slate-850">
                      <span className="text-slate-500 block text-[9px]">Binding Affinity</span>
                      <span className="font-bold text-red-400 text-sm">{m.bindingAffinity} kcal/mol</span>
                    </div>
                    <div className="p-2.5 bg-[#0b0e14] rounded-xl border border-slate-850">
                      <span className="text-slate-500 block text-[9px]">Binding Energy</span>
                      <span className="font-bold text-slate-200 text-sm">{m.bindingEnergy} eV</span>
                    </div>
                    <div className="p-2.5 bg-[#0b0e14] rounded-xl border border-slate-850">
                      <span className="text-slate-500 block text-[9px]">Protein Stability</span>
                      <span className="font-bold text-emerald-400 text-sm">+{m.proteinStability}% delta</span>
                    </div>
                    <div className="p-2.5 bg-[#0b0e14] rounded-xl border border-slate-850">
                      <span className="text-slate-500 block text-[9px]">Reaction Probability</span>
                      <span className="font-bold text-slate-200 text-sm">{m.reactionProbability}%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0b0e14]/50 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Electron Orbital Profile</span>
                    <p className="text-[10px] font-medium text-slate-300 leading-normal font-sans">
                      {m.electronInteraction}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 bg-[#11151c]/40 rounded-3xl space-y-2">
          <Atom className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
          <p className="font-bold text-slate-400">Quantum Simulator Dormant.</p>
          <p className="text-[11px] text-slate-500">To run quantum calculations, go to the "Generative Molecules" sub-tab and click "Queue Simulation" on active compounds.</p>
        </div>
      )}
    </div>
  );
}
