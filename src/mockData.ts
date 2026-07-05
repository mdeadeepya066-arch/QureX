import { Patient, DiseasePriority, ResearchTeam, Molecule, CandidateDrug, CloudArchitectureNode } from './types';

export const INITIAL_DISEASES: DiseasePriority[] = [
  {
    id: 'dis-als',
    name: 'Amyotrophic Lateral Sclerosis (ALS)',
    priorityScore: 92,
    severity: 'Critical',
    mortality: '90% within 5 years',
    researchGap: 'No target-selective neuroprotective drug exists. Current drugs (Riluzole) offer only marginal survival extension (2-3 months).',
    currentTreatments: ['Riluzole', 'Edaravone', 'Sodium Phenylbutyrate/Taurursodiol'],
    category: 'Neurological'
  },
  {
    id: 'dis-gbm',
    name: 'Glioblastoma Multiforme (GBM)',
    priorityScore: 96,
    severity: 'Critical',
    mortality: '95% within 3 years',
    researchGap: 'Highly invasive cells bypass the Blood-Brain Barrier (BBB). Resistance to Temozolomide via MGMT promoter methylation.',
    currentTreatments: ['Temozolomide', 'Radiation Therapy', 'Tumor Treating Fields (Optune)', 'Surgery'],
    category: 'Oncology'
  },
  {
    id: 'dis-alz',
    name: "Alzheimer's Disease",
    priorityScore: 89,
    severity: 'High',
    mortality: '35% within 10 years of diagnosis',
    researchGap: 'Amyloid-beta clearing agents fail to halt cognitive decline. Lack of robust tau-targeting neurofibrillary tangles inhibitor.',
    currentTreatments: ['Donepezil', 'Memantine', 'Lecanemab', 'Aducanumab'],
    category: 'Neurological'
  },
  {
    id: 'dis-panc',
    name: 'Pancreatic Ductal Adenocarcinoma',
    priorityScore: 94,
    severity: 'Critical',
    mortality: '88% within 5 years',
    researchGap: 'Dense desmoplastic stroma prevents drug delivery. Lack of selective KRAS G12D inhibitors with acceptable toxicity.',
    currentTreatments: ['Gemcitabine', 'FOLFIRINOX', 'Abraxane', 'Surgery'],
    category: 'Oncology'
  },
  {
    id: 'dis-cf',
    name: 'Cystic Fibrosis (Severe Class II)',
    priorityScore: 78,
    severity: 'High',
    mortality: 'Life expectancy ~50 years',
    researchGap: 'CFTR corrector therapies are highly expensive and ineffective against ultra-rare nonsense/frameshift mutations.',
    currentTreatments: ['Trikafta (Elexacaftor/Tezacaftor/Ivacaftor)', 'Inhaled Pulmozyme', 'Bronchodilators'],
    category: 'Genetic'
  },
  {
    id: 'dis-hd',
    name: "Huntington's Disease",
    priorityScore: 85,
    severity: 'High',
    mortality: '100% (Fatal progressive disease)',
    researchGap: 'Lack of allele-specific huntingtin gene-silencing therapeutics that block mutant mHTT without affecting wild-type HTT.',
    currentTreatments: ['Tetrabenazine', 'Deutetrabenazine', 'Antipsychotics'],
    category: 'Neurological'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    name: 'Eleanor Vance',
    age: 34,
    gender: 'Female',
    symptoms: ['Progressive muscle weakness', 'Fasciculations in upper limbs', 'Dysarthria'],
    diagnosis: 'Amyotrophic Lateral Sclerosis (ALS)',
    geneMutations: ['SOD1-A4V', 'C9orf72-Expansion'],
    bloodParameters: { wbc: 6.8, rbc: 4.2, hemoglobin: 13.5, platelets: 245, crp: 1.2 },
    diseaseStage: 'Stage II',
    currentMedicines: ['Riluzole 50mg BID', 'Baclofen 10mg TID'],
    previousTreatments: ['Gabapentin', 'Physical Therapy'],
    hospital: 'Mayo Clinic',
    confidenceScore: 98,
    uploadedAt: '2026-06-15T10:30:00Z',
    recordType: 'Genetic Report'
  },
  {
    id: 'pat-002',
    name: 'Arthur Pendelton',
    age: 62,
    gender: 'Male',
    symptoms: ['Cognitive decline', 'Severe memory loss', 'Aphasia', 'Disorientation'],
    diagnosis: "Alzheimer's Disease",
    geneMutations: ['APOE-ε4/ε4', 'TREM2-R47H'],
    bloodParameters: { wbc: 5.4, rbc: 4.6, hemoglobin: 14.8, platelets: 190, crp: 4.8 },
    diseaseStage: 'Stage III',
    currentMedicines: ['Donepezil 10mg QD', 'Memantine 20mg QD'],
    previousTreatments: ['Aducanumab (discontinued due to ARIA)'],
    hospital: 'Johns Hopkins Hospital',
    confidenceScore: 95,
    uploadedAt: '2026-06-18T14:20:00Z',
    recordType: 'Medical History'
  },
  {
    id: 'pat-003',
    name: 'Sarah Jenkins',
    age: 45,
    gender: 'Female',
    symptoms: ['Persistent dry cough', 'Chronic lung infections', 'Malabsorption', 'High sweat chloride'],
    diagnosis: 'Cystic Fibrosis',
    geneMutations: ['CFTR-F508del', 'CFTR-G551D'],
    bloodParameters: { wbc: 11.2, rbc: 3.9, hemoglobin: 11.8, platelets: 320, crp: 15.4 },
    diseaseStage: 'Stage III',
    currentMedicines: ['Trikafta', 'Inhaled Tobramycin', 'Pancrelipase EC'],
    previousTreatments: ['Ivacaftor monotherapy (partial response)'],
    hospital: 'Boston Children\'s Hospital',
    confidenceScore: 99,
    uploadedAt: '2026-06-20T08:15:00Z',
    recordType: 'Blood Report'
  },
  {
    id: 'pat-004',
    name: 'Marcus Brody',
    age: 58,
    gender: 'Male',
    symptoms: ['Severe headaches', 'Cognitive fog', 'New onset seizures', 'Left-sided hemiparesis'],
    diagnosis: 'Glioblastoma Multiforme (GBM)',
    geneMutations: ['EGFRvIII-Positive', 'MGMT-Unmethylated', 'IDH1-Wildtype'],
    bloodParameters: { wbc: 8.5, rbc: 4.5, hemoglobin: 15.2, platelets: 210, crp: 6.2 },
    diseaseStage: 'Stage IV',
    currentMedicines: ['Temozolomide 150mg/m2', 'Dexamethasone 4mg QD', 'Keppra 500mg BID'],
    previousTreatments: ['Surgical Resection (subtotal)', 'Standard Radiotherapy (60 Gy)'],
    hospital: 'Dana-Farber Cancer Institute',
    confidenceScore: 97,
    uploadedAt: '2026-06-22T11:45:00Z',
    recordType: 'CT Scan'
  },
  {
    id: 'pat-005',
    name: 'David Zhao',
    age: 28,
    gender: 'Male',
    symptoms: ['Lower limb fasciculations', 'Unilateral hand weakness', 'Cramping'],
    diagnosis: 'Amyotrophic Lateral Sclerosis (ALS)',
    geneMutations: ['C9orf72-Expansion', 'TARDBP-M337V'],
    bloodParameters: { wbc: 5.9, rbc: 4.8, hemoglobin: 15.1, platelets: 230, crp: 0.9 },
    diseaseStage: 'Stage I',
    currentMedicines: ['Riluzole 50mg BID'],
    previousTreatments: ['None'],
    hospital: 'Stanford Health Care',
    confidenceScore: 96,
    uploadedAt: '2026-06-25T16:00:00Z',
    recordType: 'Genetic Report'
  },
  {
    id: 'pat-006',
    name: 'Clara Oswald',
    age: 41,
    gender: 'Female',
    symptoms: ['Involuntary choreic movements', 'Depression', 'Irritability', 'Slight dysarthria'],
    diagnosis: "Huntington's Disease",
    geneMutations: ['HTT-CAG-Repeat-46'],
    bloodParameters: { wbc: 6.1, rbc: 4.3, hemoglobin: 13.2, platelets: 250, crp: 1.5 },
    diseaseStage: 'Stage II',
    currentMedicines: ['Deutetrabenazine 12mg BID', 'Sertraline 50mg QD'],
    previousTreatments: ['Tetrabenazine (discontinued due to side effects)'],
    hospital: 'UCSF Medical Center',
    confidenceScore: 99,
    uploadedAt: '2026-06-28T09:30:00Z',
    recordType: 'Genetic Report'
  },
  {
    id: 'pat-007',
    name: 'Frank Underwood',
    age: 66,
    gender: 'Male',
    symptoms: ['Painless jaundice', 'Unexplained weight loss 15 lbs', 'Mid-back pain', 'Steatorrhea'],
    diagnosis: 'Pancreatic Ductal Adenocarcinoma',
    geneMutations: ['KRAS-G12D', 'TP53-Loss', 'CDKN2A-Inactivated'],
    bloodParameters: { wbc: 9.4, rbc: 3.8, hemoglobin: 11.2, platelets: 165, crp: 18.5 },
    diseaseStage: 'Stage III',
    currentMedicines: ['Creon 24000U with meals', 'Oxycodone 5mg PRN'],
    previousTreatments: ['Gemcitabine + Nab-paclitaxel (Chemo-refractory)'],
    hospital: 'MD Anderson Cancer Center',
    confidenceScore: 94,
    uploadedAt: '2026-06-29T15:10:00Z',
    recordType: 'CT Scan'
  },
  {
    id: 'pat-008',
    name: 'Gwen Stacy',
    age: 23,
    gender: 'Female',
    symptoms: ['Frequent respiratory wheezing', 'Productive cough', 'Shortness of breath'],
    diagnosis: 'Cystic Fibrosis',
    geneMutations: ['CFTR-F508del', 'CFTR-N1303K'],
    bloodParameters: { wbc: 12.8, rbc: 4.1, hemoglobin: 12.4, platelets: 380, crp: 22.1 },
    diseaseStage: 'Stage II',
    currentMedicines: ['Elexacaftor/Tezacaftor/Ivacaftor', 'Hypertonic Saline Nebulizer'],
    previousTreatments: ['Tezacaftor/Ivacaftor (modest improvement)'],
    hospital: 'Cleveland Clinic',
    confidenceScore: 97,
    uploadedAt: '2026-07-01T10:00:00Z',
    recordType: 'Blood Report'
  },
  {
    id: 'pat-009',
    name: 'Charles Xavier',
    age: 52,
    gender: 'Male',
    symptoms: ['Rapid progression of muscle atrophy', 'Spasticity', 'Diaphragmatic weakness'],
    diagnosis: 'Amyotrophic Lateral Sclerosis (ALS)',
    geneMutations: ['SOD1-G93A', 'FUS-R521C'],
    bloodParameters: { wbc: 7.2, rbc: 4.4, hemoglobin: 14.0, platelets: 215, crp: 2.1 },
    diseaseStage: 'Stage III',
    currentMedicines: ['Riluzole 50mg BID', 'Radicava Oral Suspension 105mg QD', 'Tizanidine 4mg HS'],
    previousTreatments: ['IV Edaravone infusions (10 cycles)'],
    hospital: 'Columbia University Irving Medical Center',
    confidenceScore: 98,
    uploadedAt: '2026-07-02T13:20:00Z',
    recordType: 'Genetic Report'
  },
  {
    id: 'pat-010',
    name: 'Harvey Dent',
    age: 48,
    gender: 'Male',
    symptoms: ['Seizures', 'Personality changes', 'Intermittent speech deficits'],
    diagnosis: 'Glioblastoma Multiforme (GBM)',
    geneMutations: ['PTEN-Loss', 'EGFRvIII-Positive', 'MGMT-Methylated'],
    bloodParameters: { wbc: 5.1, rbc: 4.0, hemoglobin: 13.9, platelets: 145, crp: 4.1 },
    diseaseStage: 'Stage III',
    currentMedicines: ['Temozolomide', 'Optune Cap therapy', 'Depakote 500mg BID'],
    previousTreatments: ['Surgical resection (98% reduction)', 'Radiotherapy with concurrent TMZ'],
    hospital: 'Northwestern Memorial Hospital',
    confidenceScore: 96,
    uploadedAt: '2026-07-03T11:00:00Z',
    recordType: 'MRI'
  }
];

export const INITIAL_TEAMS: ResearchTeam[] = [
  // ALS parallel teams
  {
    id: 'team-als-a',
    diseaseId: 'dis-als',
    teamName: 'DeepMind ALS Guild',
    selectedDataset: 'C9orf72 Expansion Variant Cohort',
    collaborators: ['Dr. Susan Miller', 'A. Vaswani (AI Developer)', 'Dr. S. Hawking (Quantum Advisor)'],
    notes: [
      'Focusing on preventing FUS protein aggregation in the motor neuron cytoplasm.',
      'Integrating a custom Graph Attention Network (GAT) to model target pocket binding.'
    ],
    activityTimeline: [
      { timestamp: '2026-06-15T09:00:00Z', action: 'Workspace Created', user: 'Dr. Susan Miller' },
      { timestamp: '2026-06-20T14:30:00Z', action: 'Imported ALS Patient Dataset v2', user: 'A. Vaswani' },
      { timestamp: '2026-06-25T11:15:00Z', action: 'Completed GNN Model Training Run #1', user: 'A. Vaswani' }
    ]
  },
  {
    id: 'team-als-b',
    diseaseId: 'dis-als',
    teamName: 'Vertex Neuro-Therapeutics',
    selectedDataset: 'SOD1 Mutant Patient Group',
    collaborators: ['Dr. Richard Feynman', 'Dr. Lisa Kudrow', 'Prof. Charles Xavier'],
    notes: [
      'Targeting SOD1 misfolding pathways.',
      'Using a Quantum-assisted binding affinity model to search for non-covalent chaperones.'
    ],
    activityTimeline: [
      { timestamp: '2026-06-16T10:00:00Z', action: 'Workspace Created', user: 'Dr. Richard Feynman' },
      { timestamp: '2026-06-22T15:45:00Z', action: 'Configured Quantum Simulator parameters', user: 'Dr. Richard Feynman' }
    ]
  },
  {
    id: 'team-als-c',
    diseaseId: 'dis-als',
    teamName: 'Salk Institute Neuro-Team',
    selectedDataset: 'Sporadic ALS Biomarker Set',
    collaborators: ['Dr. Jonas Salk II', 'Dr. Rosalind Franklin'],
    notes: [
      'Focusing on microglial neuroinflammation targets.',
      'Training Transformer models to generate anti-inflammatory peptide sequences.'
    ],
    activityTimeline: [
      { timestamp: '2026-06-18T14:00:00Z', action: 'Workspace Created', user: 'Dr. Jonas Salk II' }
    ]
  },

  // GBM parallel teams
  {
    id: 'team-gbm-a',
    diseaseId: 'dis-gbm',
    teamName: 'Harvard Broad Institute',
    selectedDataset: 'EGFRvIII Amplified Glioblastoma Cohort',
    collaborators: ['Dr. Eric Lander', 'Dr. Jennifer Doudna', 'Steve Jobs'],
    notes: [
      'Overcoming blood-brain barrier (BBB) efflux pumps using active transport mimicking molecules.',
      'Combining deep learning models with molecular docking on EGFRvIII mutant tyrosine kinase pockets.'
    ],
    activityTimeline: [
      { timestamp: '2026-06-20T09:00:00Z', action: 'Workspace Created', user: 'Dr. Eric Lander' },
      { timestamp: '2026-06-24T16:00:00Z', action: 'Ingested CT/MRI structural patient datasets', user: 'Dr. Jennifer Doudna' }
    ]
  },
  {
    id: 'team-gbm-b',
    diseaseId: 'dis-gbm',
    teamName: 'Crick Cancer Research Group',
    selectedDataset: 'MGMT Methylated Patient Records',
    collaborators: ['Dr. Francis Crick Jr.', 'Dr. James Watson III'],
    notes: [
      'Evaluating alkylating agent synergizers.',
      'Simulating quantum-electronic interaction of candidates with MGMT repair enzymes.'
    ],
    activityTimeline: [
      { timestamp: '2026-06-21T11:00:00Z', action: 'Workspace Created', user: 'Dr. Francis Crick Jr.' }
    ]
  }
];

export const INITIAL_MOLECULES: Molecule[] = [
  // Team ALS A molecules
  {
    id: 'mol-als-001',
    teamId: 'team-als-a',
    name: 'AmyloShield-1',
    formula: 'C19H22N4O2S',
    smile: 'CC1=C(C(=O)N(C1=O)C2=CC=C(C=C2)S(=O)(=O)NC3=CC=CC=C3)C4=CC=CC=C4',
    drugLikeness: 88,
    confidence: 94,
    noveltyScore: 82,
    targetProtein: 'FUS-RGG-Domain',
    syntheticAccessibility: 75,
    status: 'Completed',
    bindingAffinity: -8.9,
    bindingEnergy: -0.32,
    electronInteraction: 'π-π stacking with Tyr-325 of FUS protein',
    proteinStability: 78,
    reactionProbability: 64,
    quantumScore: 89
  },
  {
    id: 'mol-als-002',
    teamId: 'team-als-a',
    name: 'NeuroCure-X5',
    formula: 'C23H28N6O3',
    smile: 'CNC(=O)C1=CN=C(N=C1C2=CNC3=C2C=CC(=C3)F)NC4CCN(CC4)C(=O)C5=CC=CC=C5',
    drugLikeness: 94,
    confidence: 91,
    noveltyScore: 95,
    targetProtein: 'C9orf72-Di-Peptide-Aggregates',
    syntheticAccessibility: 61,
    status: 'Completed',
    bindingAffinity: -10.4,
    bindingEnergy: -0.48,
    electronInteraction: 'Electrostatic binding with poly-GR expansion chains',
    proteinStability: 85,
    reactionProbability: 72,
    quantumScore: 96
  },

  // Team ALS B molecules
  {
    id: 'mol-als-003',
    teamId: 'team-als-b',
    name: 'SodChaperone-Q',
    formula: 'C16H18FN3O3S',
    smile: 'CC1CCN(CC1)C2=C(C=C(C(=N2)F)C3=CN=C(S3)NC(=O)O)C',
    drugLikeness: 82,
    confidence: 88,
    noveltyScore: 78,
    targetProtein: 'SOD1-Misfolded-Pocket',
    syntheticAccessibility: 88,
    status: 'Completed',
    bindingAffinity: -7.6,
    bindingEnergy: -0.19,
    electronInteraction: 'Hydrogen bonding with Lys-122 of SOD1 monomer dimer-interface',
    proteinStability: 69,
    reactionProbability: 81,
    quantumScore: 79
  },
  {
    id: 'mol-als-004',
    teamId: 'team-als-b',
    name: 'Q-Synapse-Stabilizer',
    formula: 'C28H34N2O5',
    smile: 'COC1=CC2=C(C=C1OC)CCN(C2)CCC3=CC(=C(C=C3)OC4=CC=CC=C4)O',
    drugLikeness: 91,
    confidence: 93,
    noveltyScore: 89,
    targetProtein: 'EAAT2-Glutamate-Transporter',
    syntheticAccessibility: 65,
    status: 'Completed',
    bindingAffinity: -9.2,
    bindingEnergy: -0.38,
    electronInteraction: 'Hydrophobic interaction stabilization of lipid membrane-bound transporter loops',
    proteinStability: 91,
    reactionProbability: 58,
    quantumScore: 92
  },

  // Team GBM A molecules
  {
    id: 'mol-gbm-001',
    teamId: 'team-gbm-a',
    name: 'GlioBlock-E3',
    formula: 'C21H20ClF3N4O3',
    smile: 'CC1=C(C(=C(N1)C)C2=C(C=C(C=C2)Cl)C3=CC=C(C=C3)C(F)(F)F)C(=O)NC4=NC=CS4',
    drugLikeness: 86,
    confidence: 96,
    noveltyScore: 91,
    targetProtein: 'EGFRvIII-Kinase-Pocket',
    syntheticAccessibility: 55,
    status: 'Completed',
    bindingAffinity: -11.2,
    bindingEnergy: -0.54,
    electronInteraction: 'Covalent docking with Cys-797 in EGFRvIII active binding pocket',
    proteinStability: 96,
    reactionProbability: 88,
    quantumScore: 98
  },
  {
    id: 'mol-gbm-002',
    teamId: 'team-gbm-a',
    name: 'BBB-Permeant-9',
    formula: 'C14H15N3O3',
    smile: 'CC1=CC=C(C=C1)N2C=C(C(=O)N2C3CCCC3)N(=O)=O',
    drugLikeness: 97,
    confidence: 95,
    noveltyScore: 71,
    targetProtein: 'MGMT-Repair-Enzyme',
    syntheticAccessibility: 92,
    status: 'Completed',
    bindingAffinity: -6.8,
    bindingEnergy: -0.15,
    electronInteraction: 'Substrate mimicry at active Cys-145 pocket of MGMT',
    proteinStability: 62,
    reactionProbability: 95,
    quantumScore: 73
  }
];

export const INITIAL_CANDIDATES: CandidateDrug[] = [
  {
    id: 'can-001',
    moleculeId: 'mol-als-002',
    moleculeName: 'NeuroCure-X5',
    formula: 'C23H28N6O3',
    teamId: 'team-als-a',
    teamName: 'DeepMind ALS Guild',
    diseaseId: 'dis-als',
    diseaseName: 'Amyotrophic Lateral Sclerosis (ALS)',
    aiConfidence: 94,
    quantumScore: 96,
    estimatedToxicity: 'Very Low',
    estimatedCost: '$4.50 / dose',
    manufacturingDifficulty: 'Medium',
    lipinskiCompliance: 'Compliant',
    wetLabReady: true,
    status: 'Pending',
    comments: [
      {
        expertName: 'Dr. Susan Miller',
        vote: 'Approve',
        text: 'NeuroCure-X5 shows outstanding BBB permeation and extremely high affinity to C9orf72 dipeptide repeats. Perfect candidate for initial validation in wet lab.',
        timestamp: '2026-06-26T14:30:00Z'
      },
      {
        expertName: 'Dr. Richard Feynman',
        vote: 'Approve',
        text: 'The quantum electrostatic simulation indicates high d-orbital overlap, which supports the extreme binding affinity of -10.4 kcal/mol. Strongly support moving forward.',
        timestamp: '2026-06-27T09:15:00Z'
      }
    ]
  },
  {
    id: 'can-002',
    moleculeId: 'mol-gbm-001',
    moleculeName: 'GlioBlock-E3',
    formula: 'C21H20ClF3N4O3',
    teamId: 'team-gbm-a',
    teamName: 'Harvard Broad Institute',
    diseaseId: 'dis-gbm',
    diseaseName: 'Glioblastoma Multiforme (GBM)',
    aiConfidence: 96,
    quantumScore: 98,
    estimatedToxicity: 'Low',
    estimatedCost: '$25.00 / dose',
    manufacturingDifficulty: 'High',
    lipinskiCompliance: '1 Violation',
    wetLabReady: true,
    status: 'Pending',
    comments: [
      {
        expertName: 'Dr. Eric Lander',
        vote: 'Approve',
        text: 'The selective covalent inhibition of EGFRvIII via Cys-797 binding is groundbreaking. Although synthesis is high-difficulty, the medical significance is critical.',
        timestamp: '2026-06-25T11:00:00Z'
      }
    ]
  },
  {
    id: 'can-003',
    moleculeId: 'mol-als-004',
    moleculeName: 'Q-Synapse-Stabilizer',
    formula: 'C28H34N2O5',
    teamId: 'team-als-b',
    teamName: 'Vertex Neuro-Therapeutics',
    diseaseId: 'dis-als',
    diseaseName: 'Amyotrophic Lateral Sclerosis (ALS)',
    aiConfidence: 91,
    quantumScore: 92,
    estimatedToxicity: 'Low',
    estimatedCost: '$2.80 / dose',
    manufacturingDifficulty: 'Low',
    lipinskiCompliance: 'Compliant',
    wetLabReady: true,
    status: 'Approved',
    comments: [
      {
        expertName: 'Dr. Jonas Salk II',
        vote: 'Approve',
        text: 'We have approved this candidate for synthesis and cellular assay trials. EAAT2 preservation shows key benefits in protecting upper motor neurons.',
        timestamp: '2026-06-24T15:20:00Z'
      }
    ]
  }
];

export const GOOGLE_CLOUD_ARCHITECTURE: CloudArchitectureNode[] = [
  { id: 'g-auth', label: 'Firebase Auth', service: 'Authentication', description: 'Secures Patient Portal, team workspace boundaries, and role-based board approvals.', x: 120, y: 110 },
  { id: 'g-storage', label: 'Cloud Storage', service: 'Object Storage', description: 'Durable, HIPAA-compliant storage bucket for medical images (MRI/CT scans) and raw reports.', x: 120, y: 220 },
  { id: 'g-api', label: 'Gemini API', service: 'AI & Language', description: 'Powering automated clinical report parsing and conversational, natural language dataset builder querying.', x: 340, y: 150 },
  { id: 'g-vertex', label: 'Vertex AI Pipelines', service: 'AI Platform', description: 'Orchestrates neural model training workflows (GNNs, CNNs, Transformers) over genomic mutation arrays.', x: 560, y: 120 },
  { id: 'g-quantum', label: 'Quantum Simulator', service: 'Simulation', description: 'Simulates quantum chemical interactions, binding energies, and molecular electrostatics.', x: 560, y: 240 },
  { id: 'g-db', label: 'Cloud SQL (PG)', service: 'Database', description: 'Structured storage for clinical extractions, workspaces, drug candidates, molecular SMILES, and review boards.', x: 340, y: 320 },
  { id: 'g-run', label: 'Cloud Run', service: 'Serverless Compute', description: 'Hosts containerized QureX full-stack environment with immediate scale-to-zero server efficiency.', x: 340, y: 440 }
];
