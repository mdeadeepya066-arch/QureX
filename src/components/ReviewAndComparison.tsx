import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, ShieldCheck, ClipboardCheck, Sparkles, CheckCircle, XCircle, AlertTriangle, Users, TrendingUp, HelpCircle, Check, MessageSquare, ListFilter, ThumbsUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CandidateDrug, DiseasePriority } from '../types';

interface ReviewAndComparisonProps {
  candidates: CandidateDrug[];
  diseases: DiseasePriority[];
  onVoteCandidate: (candidateId: string, expertName: string, vote: CandidateDrug['comments'][number]['vote'], commentText: string) => void;
}

export default function ReviewAndComparison({ candidates, diseases, onVoteCandidate }: ReviewAndComparisonProps) {
  const [selectedDiseaseId, setSelectedDiseaseId] = useState('All');
  const [voterName, setVoterName] = useState('Dr. Deepya');
  const [voteOpinion, setVoteOpinion] = useState<'Approve' | 'Reject' | 'Revision'>('Approve');
  const [commentText, setCommentText] = useState('');
  const [activeReviewId, setActiveReviewId] = useState<string | null>(candidates[0]?.id || null);

  // Filter candidates by disease lookup
  const filteredCandidates = candidates.filter(c => {
    return selectedDiseaseId === 'All' || c.diseaseId === selectedDiseaseId;
  });

  const activeCandidate = candidates.find(c => c.id === activeReviewId);

  // Parse comparison chart data comparing candidate metrics side by side
  const comparisonData = filteredCandidates.map(c => ({
    name: `${c.moleculeName} (${c.teamName.substring(0, 8)}...)`,
    'AI Score': c.aiConfidence,
    'Quantum Score': c.quantumScore,
    'Binding Affinity (Positive)': Math.abs(c.quantumScore * 0.1) // simulate binding energy magnitude
  }));

  const handleVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName.trim() || !commentText.trim() || !activeReviewId) return;

    onVoteCandidate(activeReviewId, voterName, voteOpinion, commentText);
    setCommentText('');
  };

  return (
    <div className="space-y-10">
      {/* Header bar and filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11151c] border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Research Synergy & Expert Evaluation</h2>
          <p className="text-xs text-slate-400">Compare metrics from parallel research teams and execute wet-lab certification votes.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold uppercase">Compare Disease:</span>
          <select
            value={selectedDiseaseId}
            onChange={(e) => {
              setSelectedDiseaseId(e.target.value);
              const firstMatch = candidates.find(c => e.target.value === 'All' || c.diseaseId === e.target.value);
              if (firstMatch) setActiveReviewId(firstMatch.id);
            }}
            className="text-xs border border-slate-850 bg-[#0b0e14] text-white px-3 py-2 rounded-xl focus:outline-hidden focus:border-blue-500 transition-colors"
          >
            <option value="All">All Diseases</option>
            {diseases.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Flagship: Comparison Engine matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Performance matrix comparison table */}
        <div className="lg:col-span-7 bg-[#161b22] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Research Comparison Engine
            </h3>
            <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-2.5 py-1 rounded-full uppercase">Consolidated matrix</span>
          </div>

          <div className="h-56 text-xs font-mono">
            {comparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#11151c', borderColor: '#334155', color: '#f1f5f9' }} />
                  <Legend />
                  <Bar dataKey="AI Score" fill="#3b82f6" name="AI Generative Score" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Quantum Score" fill="#06b6d4" name="Quantum Stability" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Generate molecule compounds in workspaces to enable analytical comparison charts.</div>
            )}
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-x-auto text-[11px] bg-[#0b0e14]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#11151c] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800 text-[9px]">
                  <th className="p-3">Candidate ID</th>
                  <th className="p-3">Design Team</th>
                  <th className="p-3">AI Score</th>
                  <th className="p-3">Quantum Score</th>
                  <th className="p-3">Lipinski Compliance</th>
                  <th className="p-3">Est. Dose Cost</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {filteredCandidates.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setActiveReviewId(c.id)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition-all ${activeReviewId === c.id ? 'bg-blue-500/5 border-l-2 border-blue-500' : ''}`}
                  >
                    <td className="p-3 font-bold text-white">{c.moleculeName} <span className="font-mono text-[9px] text-slate-500">({c.id})</span></td>
                    <td className="p-3 font-medium text-slate-400">{c.teamName}</td>
                    <td className="p-3 font-bold font-mono text-blue-400">{c.aiConfidence}%</td>
                    <td className="p-3 font-bold font-mono text-cyan-400">{c.quantumScore}%</td>
                    <td className="p-3 font-medium text-slate-400">{c.lipinskiCompliance}</td>
                    <td className="p-3 font-bold text-slate-400">{c.estimatedCost}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        c.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : c.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No drug candidates found matching filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flagship: expert review and voting board */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {activeCandidate ? (
              <motion.div
                key={activeCandidate.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5"
              >
                {/* Header card info */}
                <div className="flex justify-between items-start border-b border-slate-850 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] bg-slate-800 border border-slate-700/50 px-2 py-0.5 rounded text-slate-400 font-mono">Team: {activeCandidate.teamName}</span>
                    <h3 className="text-lg font-bold text-white mt-1">{activeCandidate.moleculeName}</h3>
                    <p className="text-xs text-slate-400">Disease context: {activeCandidate.diseaseName}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Wet Lab Ready</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Compliant
                    </span>
                  </div>
                </div>

                {/* Score indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#0b0e14] rounded-2xl border border-slate-850 text-center space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">AI Validation</span>
                    <div className="text-2xl font-extrabold text-blue-400 font-mono">{activeCandidate.aiConfidence}%</div>
                  </div>
                  <div className="p-3 bg-[#0b0e14] rounded-2xl border border-slate-850 text-center space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Quantum Score</span>
                    <div className="text-2xl font-extrabold text-cyan-400 font-mono">{activeCandidate.quantumScore}%</div>
                  </div>
                </div>

                {/* Toxicity / Cost / Lipinski */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-[#0b0e14] border border-slate-850 rounded-xl">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Est. Toxicity</span>
                    <span className="font-bold text-slate-200">{activeCandidate.estimatedToxicity}</span>
                  </div>
                  <div className="p-2.5 bg-[#0b0e14] border border-slate-850 rounded-xl">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Est. Cost</span>
                    <span className="font-bold text-slate-200">{activeCandidate.estimatedCost.split(' ')[0]}</span>
                  </div>
                  <div className="p-2.5 bg-[#0b0e14] border border-slate-850 rounded-xl">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Mfg Difficulty</span>
                    <span className="font-bold text-slate-200">{activeCandidate.manufacturingDifficulty}</span>
                  </div>
                </div>

                {/* Voter Comments History */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Board Decision History</span>
                  <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                    {activeCandidate.comments.map((c, i) => (
                      <div key={i} className="p-3 bg-[#0b0e14] rounded-xl border border-slate-850 text-[11px] leading-relaxed space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-slate-200">{c.expertName}</span>
                          <span className={`font-mono font-bold px-1.5 rounded border ${
                            c.vote === 'Approve' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : c.vote === 'Reject' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>{c.vote}</span>
                        </div>
                        <p className="text-slate-400 font-medium font-sans">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* voting Form */}
                <form id="expert-vote-form" onSubmit={handleVoteSubmit} className="space-y-3 pt-3 border-t border-slate-850">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Reviewer Name</label>
                      <input
                        type="text"
                        value={voterName}
                        onChange={(e) => setVoterName(e.target.value)}
                        className="w-full border border-slate-850 bg-[#0b0e14] text-white p-2 text-xs rounded-xl focus:outline-hidden focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Clinical Recommendation</label>
                      <select
                        value={voteOpinion}
                        onChange={(e) => setVoteOpinion(e.target.value as any)}
                        className="w-full border border-slate-850 bg-[#0b0e14] text-white p-2 text-xs rounded-xl focus:outline-hidden focus:border-blue-500 transition-colors"
                      >
                        <option value="Approve">Approve Candidate</option>
                        <option value="Reject">Reject Target</option>
                        <option value="Revision">Request Revision</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Expert Supporting Evidence / Comments</label>
                    <textarea
                      placeholder="Add molecular structural justifications or synthesis constraints here..."
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full border border-slate-850 bg-[#0b0e14] text-white p-2 text-xs rounded-xl focus:outline-hidden focus:border-blue-500 font-sans transition-colors"
                      required
                    />
                  </div>

                  <button
                    id="btn-expert-vote-submit"
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                  >
                    <ClipboardCheck className="w-4 h-4 text-white" /> Cast Finalization Vote
                  </button>
                </form>
              </motion.div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-[#161b22] border border-dashed border-slate-800 rounded-3xl h-full flex flex-col items-center justify-center">
                <ListFilter className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                <p className="font-bold text-slate-400">Expert Board Dormant</p>
                <p className="text-xs max-w-xs leading-relaxed mt-1 text-slate-500">No drug candidates found. Work in team workspaces to discover innovative high-quantum molecules and promote them to the board.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
