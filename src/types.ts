export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  country?: string;
  clinicalSummary?: string;
  symptoms: string[];
  diagnosis: string;
  geneMutations: string[];
  bloodParameters: {
    wbc: number; // K/uL
    rbc: number; // M/uL
    hemoglobin: number; // g/dL
    platelets: number; // K/uL
    crp: number; // mg/L (C-reactive protein)
  };
  diseaseStage: string; // "Stage I", "Stage II", "Stage III", "Stage IV"
  currentMedicines: string[];
  previousTreatments: string[];
  hospital: string;
  confidenceScore: number; // 0-100
  uploadedAt: string;
  recordType: 'Blood Report' | 'MRI' | 'CT Scan' | 'X-Ray' | 'Genetic Report' | 'Prescription' | 'Medical History' | 'Symptoms';
  rawText?: string;
  structuredJson?: string;
}

export interface DiseasePriority {
  id: string;
  name: string;
  priorityScore: number;
  severity: 'High' | 'Critical' | 'Medium' | 'Low';
  mortality: string; // e.g. "45%"
  researchGap: string; // e.g. "No target-selective inhibitor exists"
  currentTreatments: string[];
  category: string;
}

export interface ResearchTeam {
  id: string;
  diseaseId: string;
  teamName: string;
  selectedDataset: string;
  collaborators: string[];
  notes: string[];
  activityTimeline: {
    timestamp: string;
    action: string;
    user: string;
  }[];
}

export interface TrainingJob {
  id: string;
  teamId: string;
  modelType: 'Graph Neural Network' | 'Transformer' | 'CNN' | 'Random Forest';
  targetProtein: string;
  hyperparameters: {
    learningRate: number;
    batchSize: number;
    epochs: number;
    optimizer: string;
  };
  status: 'Queued' | 'Running' | 'Completed';
  metrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    loss: number;
    f1Score: number;
    trainingTime: string;
    gpuUsed: string;
  };
  progress: number; // 0-100
  startedAt: string;
}

export interface Molecule {
  id: string;
  teamId: string;
  name: string; // e.g., "Q-219-X"
  formula: string; // e.g., "C21H24N4O3"
  smile: string; // e.g., "CC1=C(C(C(=C(N1)C)C(=O)OC)C2=CC=CC=C2[N+](=O)[O-])C"
  drugLikeness: number; // 0-100
  confidence: number; // 0-100
  noveltyScore: number; // 0-100
  targetProtein: string;
  syntheticAccessibility: number; // 0-100
  status: 'Completed' | 'Running' | 'Queued';
  // Quantum properties (simulated)
  bindingAffinity?: number; // kcal/mol (e.g. -9.4)
  bindingEnergy?: number; // eV
  electronInteraction?: string; // e.g., "High d-orbital overlap"
  proteinStability?: number; // % stabilization
  reactionProbability?: number; // 0-100
  quantumScore?: number; // 0-100
}

export interface CandidateDrug {
  id: string;
  moleculeId: string;
  moleculeName: string;
  formula: string;
  teamId: string;
  teamName: string;
  diseaseId: string;
  diseaseName: string;
  aiConfidence: number; // 0-100
  quantumScore: number; // 0-100
  estimatedToxicity: 'Very Low' | 'Low' | 'Moderate' | 'High';
  estimatedCost: string; // e.g. "$12 / dose"
  manufacturingDifficulty: 'Low' | 'Medium' | 'High';
  lipinskiCompliance: 'Compliant' | '1 Violation' | 'Non-Compliant';
  wetLabReady: boolean;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Revision';
  comments: {
    expertName: string;
    vote: 'Approve' | 'Reject' | 'Revision';
    text: string;
    timestamp: string;
  }[];
}

export interface CloudArchitectureNode {
  id: string;
  label: string;
  service: string;
  description: string;
  x: number;
  y: number;
}
