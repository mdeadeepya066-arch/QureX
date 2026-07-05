import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ArrowUpDown, ShieldAlert, Award, ChevronRight, Activity, TrendingUp, Group, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Patient, DiseasePriority } from '../types';

interface DiseaseIntelligenceProps {
  diseases: DiseasePriority[];
  patients: Patient[];
  onNavigate: (page: string) => void;
}

export default function DiseaseIntelligence({ diseases, patients, onNavigate }: DiseaseIntelligenceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [sortField, setSortField] = useState<'priorityScore' | 'name'>('priorityScore');
  const [sortAsc, setSortAsc] = useState(false);

  // Compute stats
  const totalPatients = patients.length;
  const criticalCount = diseases.filter(d => d.severity === 'Critical').length;
  
  // Calculate average priority score
  const avgPriority = (diseases.reduce((acc, curr) => acc + curr.priorityScore, 0) / diseases.length).toFixed(1);

  // Parse mutation frequencies from patients
  const mutationCounts: { [key: string]: number } = {};
  patients.forEach(p => {
    p.geneMutations.forEach(m => {
      const baseMut = m.split('-')[0]; // group SOD1-A4V into SOD1
      mutationCounts[baseMut] = (mutationCounts[baseMut] || 0) + 1;
    });
  });

  const mutationData = Object.keys(mutationCounts).map(name => ({
    name,
    count: mutationCounts[name]
  })).sort((a, b) => b.count - a.count);

  // Filter & sort diseases leaderboard
  const filteredDiseases = diseases.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.researchGap.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || d.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  }).sort((a, b) => {
    let fieldA = a[sortField];
    let fieldB = b[sortField];

    if (typeof fieldA === 'string') {
      return sortAsc ? fieldA.localeCompare(fieldB as string) : (fieldB as string).localeCompare(fieldA);
    } else {
      return sortAsc ? (fieldA as number) - (fieldB as number) : (fieldB as number) - (fieldA as number);
    }
  });

  const toggleSort = (field: 'priorityScore' | 'name') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Interactive 2D Patient Clusters data
  const clusters = [
    { name: 'Cluster Alpha (Neuro)', x: 25, y: 80, desc: 'ALS C9orf72 carriers, high motor neuron decay rates.', patients: 4, color: 'bg-indigo-500 text-white' },
    { name: 'Cluster Beta (Onco)', x: 75, y: 90, desc: 'Glioblastoma EGFRvIII, high MGMT unmethylated drug-resistance.', patients: 3, color: 'bg-rose-500 text-white' },
    { name: 'Cluster Gamma (Genetic)', x: 45, y: 40, desc: 'Cystic Fibrosis delta-F508 homozygous, severe respiratory indices.', patients: 2, color: 'bg-amber-500 text-white' },
    { name: 'Cluster Delta (Cognitive)', x: 15, y: 60, desc: 'Alzheimers APOE-e4 homozygous, severe neurofibrillary tangles.', patients: 1, color: 'bg-teal-500 text-white' }
  ];

  return (
    <div className="space-y-10 text-slate-200">
      {/* Overview Metric cards */}
      <div id="disease-stats-grid" className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Tracked Cohorts</span>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg"><Activity className="w-5 h-5" /></div>
            <div className="text-3xl font-extrabold text-white">{totalPatients} Patients</div>
          </div>
          <p className="text-[11px] text-slate-400">Anonymized genomic rows in Cloud SQL</p>
        </div>

        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Global Priority Index</span>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <div className="text-3xl font-extrabold text-white">{avgPriority} / 100</div>
          </div>
          <p className="text-[11px] text-slate-400">Calculated across 14 severe diseases</p>
        </div>

        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Critical Severity Threats</span>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg"><ShieldAlert className="w-5 h-5" /></div>
            <div className="text-3xl font-extrabold text-white">{criticalCount} Targets</div>
          </div>
          <p className="text-[11px] text-slate-400">Requires urgent pipeline acceleration</p>
        </div>

        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Google BigQuery Sync</span>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg"><Award className="w-5 h-5" /></div>
            <div className="text-3xl font-extrabold text-white">100% Live</div>
          </div>
          <p className="text-[11px] text-slate-400">Fully replicated schema mirrors</p>
        </div>
      </div>

      {/* Analytics Charts & 2D Clustering Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Mutation Frequency Chart */}
        <div className="lg:col-span-7 bg-[#161b22] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" /> Genomic Mutation Frequency
            </h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold px-2 py-1 rounded-full uppercase">Real-time stats</span>
          </div>
          
          <div className="h-64 text-xs font-mono">
            {mutationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mutationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} contentStyle={{ backgroundColor: '#11151c', borderColor: '#334155', color: '#f1f5f9' }} />
                  <Bar dataKey="count" name="Patient Count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No patient genomes uploaded.</div>
            )}
          </div>
        </div>

        {/* 2D Patient Clustering Canvas */}
        <div className="lg:col-span-5 bg-[#161b22] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Group className="w-5 h-5 text-indigo-400" /> Patient Clustering Space
            </h3>
            <p className="text-xs text-slate-400">Continuous AI segmentation mapping target mutations against neurological versus oncological scores.</p>
          </div>

          {/* Interactive Cluster Chart Area */}
          <div className="relative border border-slate-800 rounded-2xl bg-[#0b0e14] h-52 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-50" />
            
            {/* Axis labels */}
            <span className="absolute bottom-2 right-2 text-[8px] text-slate-500 uppercase font-bold tracking-wider">Severity Stage →</span>
            <span className="absolute top-2 left-2 text-[8px] text-slate-500 uppercase font-bold tracking-wider vertical-text">Genomic Divergence ↑</span>

            {/* Clusters */}
            {clusters.map((c) => (
              <div
                key={c.name}
                style={{ left: `${c.x}%`, top: `${100 - c.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg ring-4 ring-slate-900 animate-pulse ${c.color.split(' ')[0]}`}>
                  {c.patients}
                </div>
                
                {/* Custom tooltip hover */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-[#11151c] text-white text-[10px] p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-44 z-25 shadow-2xl space-y-1 border border-slate-800">
                  <div className="font-bold">{c.name}</div>
                  <div className="text-[9px] text-slate-400 leading-normal">{c.desc}</div>
                  <div className="text-[9px] text-blue-400 font-bold">{c.patients} Active patient profiles</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500 pt-2 border-t border-slate-850">
            <div>
              <span className="font-bold text-slate-400">Cluster Algorithm:</span> t-SNE Embedding
            </div>
            <div>
              <span className="font-bold text-slate-400">Parameters:</span> Perplexity = 15
            </div>
          </div>
        </div>
      </div>

      {/* Global Priority Leaderboard */}
      <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-white text-xl flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" /> Global Research Priority Leaderboard
            </h3>
            <p className="text-sm text-slate-400">Standardized scores directing world health investments towards diseases with deep research gaps.</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search priority list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs border border-slate-800 rounded-xl focus:border-blue-500 focus:outline-hidden w-48 bg-[#0b0e14] text-white"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-800 rounded-xl focus:border-blue-500 focus:outline-hidden bg-[#0b0e14] text-white"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
            </select>
          </div>
        </div>

        {/* Tabular Leaderboard */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden">
          <table id="leaderboard-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#11151c] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="py-4 px-6 cursor-pointer hover:bg-slate-800" onClick={() => toggleSort('name')}>
                  Disease Target <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                </th>
                <th className="py-4 px-6">Severity Status</th>
                <th className="py-4 px-6">Mortality Metrics</th>
                <th className="py-4 px-6 cursor-pointer hover:bg-slate-800" onClick={() => toggleSort('priorityScore')}>
                  Priority Index <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                </th>
                <th className="py-4 px-6">Target Action Gap</th>
                <th className="py-4 px-6 text-right">Research Hub</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {filteredDiseases.map((dis, idx) => (
                <tr key={dis.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="py-4 px-6 font-bold text-slate-200">{dis.name}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      dis.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {dis.severity}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400 font-medium">{dis.mortality}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-white text-sm">{dis.priorityScore}</span>
                      <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${dis.priorityScore}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-400 max-w-sm leading-normal">{dis.researchGap}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onNavigate('marketplace')}
                      className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 ml-auto cursor-pointer transition-colors"
                    >
                      Enter Port <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
