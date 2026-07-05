import React from 'react';
import { motion } from 'motion/react';
import { Shield, Brain, Activity, Database, GitMerge, Award, ChevronRight, Server, Atom, Users } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const stats = [
    { label: 'Avg. Drug Discovery Timeline', value: '18 Days', desc: 'Down from 12+ years via AI/Quantum acceleration', icon: Activity },
    { label: 'Target Binding Accuracy', value: '94.2%', desc: 'Powered by Graph Neural Networks (GNN)', icon: Brain },
    { label: 'Quantum Overlap Score', value: '0.04 eV', desc: 'Precision electron-orbital bonding simulation', icon: Atom },
    { label: 'Patient Cohort Registries', value: '14,200+', desc: 'Anonymized, secure genomic and clinical rows', icon: Database }
  ];

  const features = [
    {
      title: 'AI Clinical Record Extraction',
      description: 'Gemini models convert unstructured patient clinical histories, MRI reports, and genetic sheets into validated JSON rows.',
      icon: Database,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      title: 'Parallel Workspace Marketplace',
      description: 'Multiple international research guilds spin up isolated secure environments to evaluate drug targets for the same disease.',
      icon: Users,
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      title: 'Deep GNN Model Training',
      description: 'Orchestrate Graph Neural Networks and Transformers directly on Vertex AI Pipelines to predict active site ligand bindings.',
      icon: Server,
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      title: 'Quantum Molecule Evaluation',
      description: 'Simulate electron interactions, thermodynamic binding affinity, and protein stability prior to laboratory synthesis.',
      icon: Atom,
      color: 'text-cyan-500 bg-cyan-500/10'
    }
  ];

  const integrations = [
    { name: 'Gemini API', role: 'Language intelligence, conversational cohort filters, and unstructured report extraction.' },
    { name: 'Vertex AI Pipelines', role: 'Serverless training workflows for generative molecular neural architectures.' },
    { name: 'Cloud Run', role: 'Instant deployment scaling for containerized full-stack drug design workspaces.' },
    { name: 'Cloud SQL & GCS', role: 'HIPAA-grade relational records and structured MRI/imaging telemetry storage.' }
  ];

  return (
    <div id="landing-page" className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-[#11151c] text-white p-8 md:p-16 border border-slate-800/80 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-3xl space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Atom className="w-3.5 h-3.5 animate-spin" /> Google Developer Hackathon Prototype
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent leading-none">
            QureX Platform
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
            Accelerating clinical target validation and drug discovery through deep neural pipelines, collaborative research guilds, and simulated quantum-assisted molecular electrostatics.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              id="cta-start-discovery"
              onClick={() => onNavigate('marketplace')}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              Enter Research Marketplace <ChevronRight className="w-4 h-4" />
            </button>
            <button
              id="cta-view-workflow"
              onClick={() => onNavigate('workflow')}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              Visualize Ingestion Workflow <GitMerge className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Statistics Cards */}
      <div id="landing-stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#161b22] rounded-2xl p-6 border border-slate-800 shadow-xl hover:border-slate-700 transition-all flex items-start gap-4"
            >
              <div className="p-3 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Platform Objectives Grid */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Core Capabilities</h2>
          <p className="text-slate-400">How QureX coordinates patient data, neural model generation, and quantum evaluations.</p>
        </div>

        <div id="landing-features-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 flex gap-4 shadow-xl hover:border-slate-700/80 transition-all">
                <div className={`p-3.5 rounded-xl h-fit ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-lg">{feat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Cloud Services Architecture */}
      <div className="bg-[#11151c]/50 rounded-3xl p-8 border border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-8 shadow-2xl">
        <div className="lg:col-span-1 space-y-4">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit rounded-lg">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-2xl font-bold text-white">Google Cloud Architecture</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            QureX is built using GCP best-practices for secure, scalable clinical data handling, high-performance compute orchestration, and deep learning evaluations.
          </p>
          <button
            onClick={() => onNavigate('workflow')}
            className="text-blue-400 hover:text-blue-300 font-semibold text-sm inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            Explore live connection paths <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div id="landing-integrations" className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((item) => (
            <div key={item.name} className="bg-[#161b22] border border-slate-800 p-5 rounded-2xl shadow-md space-y-1 hover:border-slate-700 transition-all">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {item.name}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
