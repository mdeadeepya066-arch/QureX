import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import types and mock data using relative TS path
import { Patient, DiseasePriority, ResearchTeam, TrainingJob, Molecule, CandidateDrug } from './src/types';
import { INITIAL_DISEASES, INITIAL_PATIENTS, INITIAL_TEAMS, INITIAL_MOLECULES, INITIAL_CANDIDATES, GOOGLE_CLOUD_ARCHITECTURE } from './src/mockData';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini API client initialized successfully.');
  } catch (err) {
    console.error('Error initializing Gemini API:', err);
  }
} else {
  console.log('No GEMINI_API_KEY environment variable found. Server will run in fully functional simulated Demo Mode.');
}

// In-memory state database to allow interactive additions/modifications during user session
const COUNTRIES_POOL = ['United States', 'United Kingdom', 'Germany', 'Japan', 'India', 'Australia', 'Canada', 'Singapore'];
let patientsState: Patient[] = INITIAL_PATIENTS.map((p, index) => {
  const country = p.country || COUNTRIES_POOL[index % COUNTRIES_POOL.length];
  const summary = p.clinicalSummary || `The uploaded report indicates a ${p.age}-year-old ${p.gender.toLowerCase()} diagnosed with ${p.diagnosis} (${p.diseaseStage}). Symptoms include ${p.symptoms.slice(0, 3).join(', ')}. Detected genetic mutations include ${p.geneMutations.join(', ')} with an overall clinical confidence of ${p.confidenceScore}%.`;
  return {
    ...p,
    country,
    clinicalSummary: summary,
    structuredJson: p.structuredJson || JSON.stringify({
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      country,
      clinicalSummary: summary,
      diagnosis: p.diagnosis,
      diseaseStage: p.diseaseStage,
      symptoms: p.symptoms,
      geneMutations: p.geneMutations,
      bloodParameters: p.bloodParameters,
      currentMedicines: p.currentMedicines,
      previousTreatments: p.previousTreatments,
      hospital: p.hospital,
      confidenceScore: p.confidenceScore,
      uploadedAt: p.uploadedAt,
      recordType: p.recordType
    }, null, 2)
  };
});
let diseasesState: DiseasePriority[] = [...INITIAL_DISEASES];
let teamsState: ResearchTeam[] = [...INITIAL_TEAMS];
let moleculesState: Molecule[] = [...INITIAL_MOLECULES];
let candidatesState: CandidateDrug[] = [...INITIAL_CANDIDATES];
let trainingJobsState: TrainingJob[] = [];

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health & Config Status
app.get('/api/config', (req, res) => {
  res.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    demoMode: true,
    localTime: new Date().toISOString()
  });
});

// 2. Diseases Priorities
app.get('/api/diseases', (req, res) => {
  res.json(diseasesState);
});

// 3. Patients (Clinical + Genomic Database)
app.get('/api/patients', (req, res) => {
  res.json(patientsState);
});

// 4. AI Patient Extraction Endpoint
app.post('/api/patients/upload', async (req, res) => {
  const { name, recordType, rawText, hospital, country } = req.body;
  
  if (!name || !recordType) {
    return res.status(400).json({ error: 'Missing name or recordType.' });
  }

  const textToParse = rawText || `Patient ${name} presented with symptoms of severe fatigue, muscular atrophy in hands, and persistent fasciculations. Blood test reveals elevated C-Reactive Protein (CRP) at 5.2 mg/L, normal hemoglobin. Genetic screening confirms a mutation in SOD1 at residue A4V. Admitted at ${hospital || 'General Hospital'} under ALS staging criteria. Staged as ALS Stage II. Currently on Riluzole.`;

  let extractedData: Partial<Patient> = {
    age: 42,
    gender: 'Male',
    diagnosis: 'Amyotrophic Lateral Sclerosis (ALS)',
    diseaseStage: 'Stage II',
    symptoms: ['Muscular atrophy', 'Fasciculations', 'Fatigue'],
    geneMutations: ['SOD1-A4V'],
    bloodParameters: { wbc: 7.2, rbc: 4.5, hemoglobin: 14.1, platelets: 220, crp: 5.2 },
    currentMedicines: ['Riluzole 50mg BID'],
    previousTreatments: ['Physical Therapy'],
    hospital: hospital || 'General Hospital',
    confidenceScore: 88,
    country: country || 'United States',
    clinicalSummary: `The uploaded report indicates a 42-year-old male diagnosed with Amyotrophic Lateral Sclerosis (ALS) (Stage II). The patient demonstrates progressive muscle atrophy and fasciculations. Genetic analysis detected a pathogenic SOD1-A4V mutation.`
  };

  let wasRealAi = false;

  // Attempt real extraction via Gemini if available
  if (ai) {
    try {
      const prompt = `Extract structured clinical and genomic information from the following medical report:
      "${textToParse}"
      
      Extract fields exactly matching this JSON format:
      {
        "age": number,
        "gender": string ("Male" or "Female"),
        "diagnosis": string,
        "diseaseStage": string,
        "symptoms": string[],
        "geneMutations": string[],
        "bloodParameters": { "wbc": number, "rbc": number, "hemoglobin": number, "platelets": number, "crp": number },
        "currentMedicines": string[],
        "previousTreatments": string[],
        "hospital": string,
        "confidenceScore": number (0-100 based on detail availability),
        "country": string,
        "clinicalSummary": string (generate a highly professional 2-3 sentence English medical report summary suitable for clinical researchers, including demographic details, diagnosis, staging, notable mutations, and therapy responses)
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        extractedData = { ...extractedData, ...parsed };
        wasRealAi = true;
      }
    } catch (err) {
      console.error('Gemini extraction failed, falling back to simulated extraction:', err);
    }
  }

  // Save new patient to in-memory state
  const selectedCountry = country || extractedData.country || 'United States';
  const finalSummary = extractedData.clinicalSummary || `The uploaded report indicates a ${extractedData.age || 42}-year-old ${(extractedData.gender || 'Male').toLowerCase()} diagnosed with ${extractedData.diagnosis || 'Amyotrophic Lateral Sclerosis (ALS)'} (${extractedData.diseaseStage || 'Stage II'}). Mapped to originating facility ${extractedData.hospital || hospital || 'General Hospital'} in ${selectedCountry}.`;
  
  const newPatient: Patient = {
    id: generateId('pat'),
    name,
    age: extractedData.age || 42,
    gender: extractedData.gender || 'Male',
    country: selectedCountry,
    symptoms: extractedData.symptoms || ['Muscular atrophy', 'Fasciculations', 'Fatigue'],
    diagnosis: extractedData.diagnosis || 'Amyotrophic Lateral Sclerosis (ALS)',
    geneMutations: extractedData.geneMutations || ['SOD1-A4V'],
    bloodParameters: extractedData.bloodParameters || { wbc: 7.2, rbc: 4.5, hemoglobin: 14.1, platelets: 220, crp: 5.2 },
    diseaseStage: extractedData.diseaseStage || 'Stage II',
    currentMedicines: extractedData.currentMedicines || ['Riluzole 50mg BID'],
    previousTreatments: extractedData.previousTreatments || ['Physical Therapy'],
    hospital: extractedData.hospital || hospital || 'General Hospital',
    confidenceScore: extractedData.confidenceScore || 88,
    uploadedAt: new Date().toISOString(),
    recordType,
    rawText: textToParse,
    clinicalSummary: finalSummary
  };

  newPatient.structuredJson = JSON.stringify({
    id: newPatient.id,
    name: newPatient.name,
    age: newPatient.age,
    gender: newPatient.gender,
    country: newPatient.country,
    clinicalSummary: newPatient.clinicalSummary,
    diagnosis: newPatient.diagnosis,
    diseaseStage: newPatient.diseaseStage,
    symptoms: newPatient.symptoms,
    geneMutations: newPatient.geneMutations,
    bloodParameters: newPatient.bloodParameters,
    currentMedicines: newPatient.currentMedicines,
    previousTreatments: newPatient.previousTreatments,
    hospital: newPatient.hospital,
    confidenceScore: newPatient.confidenceScore,
    uploadedAt: newPatient.uploadedAt,
    recordType: newPatient.recordType
  }, null, 2);

  patientsState.unshift(newPatient);

  res.json({
    success: true,
    wasRealAi,
    patient: newPatient
  });
});

// 5. Conversational Dataset Builder Endpoint
app.post('/api/dataset-builder', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Missing natural language query.' });
  }

  let filterCriteria = {
    ageMin: 0,
    ageMax: 120,
    gender: null as string | null,
    diagnosis: null as string | null,
    mutation: null as string | null,
    stage: null as string | null,
    failedTreatment: null as string | null
  };

  let wasRealAi = false;

  if (ai) {
    try {
      const prompt = `Translate this medical search query into structured query filter fields:
      Query: "${query}"
      
      Translate into this exact JSON object structure:
      {
        "ageMin": number or null,
        "ageMax": number or null,
        "gender": string or null (e.g. "Male", "Female"),
        "diagnosis": string or null (match substrings like "ALS", "Alzheimer", "Cystic Fibrosis", "Glioblastoma"),
        "mutation": string or null (e.g. "SOD1", "APOE", "EGFR", "CFTR", "KRAS"),
        "stage": string or null (e.g. "Stage I", "Stage II", "Stage III", "Stage IV"),
        "failedTreatment": string or null (e.g. "Temozolomide", "Riluzole")
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        filterCriteria = { ...filterCriteria, ...parsed };
        wasRealAi = true;
      }
    } catch (err) {
      console.error('Gemini dataset builder parsing failed, falling back to regex match:', err);
    }
  }

  // Fallback / Regex match if AI not available or failed
  if (!wasRealAi) {
    // Basic heuristic rules for Demo Mode
    const queryLower = query.toLowerCase();
    
    // Age matches
    const ageRangeMatch = queryLower.match(/aged?\s+(\d+)\s*[-–to]+\s*(\d+)/) || queryLower.match(/(\d+)\s*[-–to]+\s*(\d+)\s+years/);
    if (ageRangeMatch) {
      filterCriteria.ageMin = parseInt(ageRangeMatch[1]);
      filterCriteria.ageMax = parseInt(ageRangeMatch[2]);
    } else {
      const ageOver = queryLower.match(/over\s+(\d+)/) || queryLower.match(/>\s*(\d+)/);
      if (ageOver) filterCriteria.ageMin = parseInt(ageOver[1]);
      
      const ageUnder = queryLower.match(/under\s+(\d+)/) || queryLower.match(/<\s*(\d+)/);
      if (ageUnder) filterCriteria.ageMax = parseInt(ageUnder[1]);
    }

    // Gender matches
    if (queryLower.includes('female') || queryLower.includes('women')) filterCriteria.gender = 'Female';
    else if (queryLower.includes('male') || queryLower.includes('men')) filterCriteria.gender = 'Male';

    // Diagnosis matches
    if (queryLower.includes('als') || queryLower.includes('lateral sclerosis')) filterCriteria.diagnosis = 'ALS';
    else if (queryLower.includes('alzheimer')) filterCriteria.diagnosis = 'Alzheimer';
    else if (queryLower.includes('cystic') || queryLower.includes('fibrosis')) filterCriteria.diagnosis = 'Cystic';
    else if (queryLower.includes('gbm') || queryLower.includes('glioblastoma')) filterCriteria.diagnosis = 'Glioblastoma';
    else if (queryLower.includes('pancreatic')) filterCriteria.diagnosis = 'Pancreatic';

    // Mutation matches
    if (queryLower.includes('sod1')) filterCriteria.mutation = 'SOD1';
    else if (queryLower.includes('apoe')) filterCriteria.mutation = 'APOE';
    else if (queryLower.includes('egfr')) filterCriteria.mutation = 'EGFR';
    else if (queryLower.includes('cftr')) filterCriteria.mutation = 'CFTR';
    else if (queryLower.includes('kras')) filterCriteria.mutation = 'KRAS';
    else if (queryLower.includes('c9orf72')) filterCriteria.mutation = 'C9orf72';

    // Stage matches
    if (queryLower.includes('stage i') || queryLower.includes('stage 1')) filterCriteria.stage = 'Stage I';
    else if (queryLower.includes('stage ii') || queryLower.includes('stage 2')) filterCriteria.stage = 'Stage II';
    else if (queryLower.includes('stage iii') || queryLower.includes('stage 3')) filterCriteria.stage = 'Stage III';
    else if (queryLower.includes('stage iv') || queryLower.includes('stage 4')) filterCriteria.stage = 'Stage IV';

    // Failed treatment matches
    if (queryLower.includes('temozolomide') || queryLower.includes('tmz')) filterCriteria.failedTreatment = 'Temozolomide';
    if (queryLower.includes('riluzole')) filterCriteria.failedTreatment = 'Riluzole';
  }

  // Filter clinical records
  const filteredPatients = patientsState.filter(p => {
    // Age check
    if (filterCriteria.ageMin && p.age < filterCriteria.ageMin) return false;
    if (filterCriteria.ageMax && p.age > filterCriteria.ageMax) return false;

    // Gender check
    if (filterCriteria.gender && p.gender !== filterCriteria.gender) return false;

    // Diagnosis check
    if (filterCriteria.diagnosis) {
      const matchDiag = p.diagnosis.toLowerCase().includes(filterCriteria.diagnosis.toLowerCase());
      if (!matchDiag) return false;
    }

    // Mutation check
    if (filterCriteria.mutation) {
      const hasMutation = p.geneMutations.some(m => m.toLowerCase().includes(filterCriteria.mutation!.toLowerCase()));
      if (!hasMutation) return false;
    }

    // Stage check
    if (filterCriteria.stage && p.diseaseStage !== filterCriteria.stage) return false;

    // Failed treatment check
    if (filterCriteria.failedTreatment) {
      const failed = p.previousTreatments.some(t => t.toLowerCase().includes(filterCriteria.failedTreatment!.toLowerCase()));
      if (!failed) return false;
    }

    return true;
  });

  res.json({
    success: true,
    wasRealAi,
    filterCriteria,
    patientsCount: filteredPatients.length,
    selectedPatients: filteredPatients
  });
});

// 6. Workspaces / Teams
app.get('/api/workspaces', (req, res) => {
  res.json(teamsState);
});

app.post('/api/workspaces/create', (req, res) => {
  const { teamName, diseaseId, selectedDataset, collaborators, initialNotes } = req.body;

  if (!teamName || !diseaseId) {
    return res.status(400).json({ error: 'Missing teamName or diseaseId.' });
  }

  const newTeam: ResearchTeam = {
    id: generateId('team'),
    diseaseId,
    teamName,
    selectedDataset: selectedDataset || 'General Clinical Cohort v1',
    collaborators: collaborators || ['Dr. Anonymous Researcher'],
    notes: initialNotes ? [initialNotes] : ['Workspace initialized.'],
    activityTimeline: [
      { timestamp: new Date().toISOString(), action: 'Workspace Created', user: 'Lead Researcher' }
    ]
  };

  teamsState.push(newTeam);
  res.json(newTeam);
});

app.post('/api/workspaces/notes', (req, res) => {
  const { teamId, noteText } = req.body;
  const team = teamsState.find(t => t.id === teamId);
  if (!team) return res.status(404).json({ error: 'Team not found.' });

  team.notes.push(noteText);
  team.activityTimeline.unshift({
    timestamp: new Date().toISOString(),
    action: `Added Research Note`,
    user: 'Team Researcher'
  });

  res.json({ success: true, notes: team.notes, timeline: team.activityTimeline });
});

// 7. Training Jobs
app.get('/api/training-jobs', (req, res) => {
  res.json(trainingJobsState);
});

app.post('/api/training-jobs/start', (req, res) => {
  const { teamId, modelType, targetProtein, learningRate, batchSize, epochs } = req.body;

  if (!teamId || !modelType || !targetProtein) {
    return res.status(400).json({ error: 'Missing target training configurations.' });
  }

  const job: TrainingJob = {
    id: generateId('job'),
    teamId,
    modelType,
    targetProtein,
    hyperparameters: {
      learningRate: parseFloat(learningRate) || 0.001,
      batchSize: parseInt(batchSize) || 32,
      epochs: parseInt(epochs) || 150,
      optimizer: 'AdamW'
    },
    status: 'Running',
    progress: 0,
    startedAt: new Date().toISOString()
  };

  trainingJobsState.unshift(job);

  // Background timer to simulate training progress
  const intervalId = setInterval(() => {
    const currentJob = trainingJobsState.find(j => j.id === job.id);
    if (!currentJob) {
      clearInterval(intervalId);
      return;
    }

    if (currentJob.progress < 100) {
      currentJob.progress += 20;
      if (currentJob.progress >= 100) {
        currentJob.progress = 100;
        currentJob.status = 'Completed';
        currentJob.metrics = {
          accuracy: +(0.85 + Math.random() * 0.12).toFixed(3),
          precision: +(0.84 + Math.random() * 0.12).toFixed(3),
          recall: +(0.82 + Math.random() * 0.14).toFixed(3),
          loss: +(0.08 + Math.random() * 0.15).toFixed(3),
          f1Score: +(0.84 + Math.random() * 0.11).toFixed(3),
          trainingTime: `${(45 + Math.random() * 120).toFixed(0)} seconds`,
          gpuUsed: 'NVIDIA H100 SXM5 (80GB)'
        };
        
        // Log in workspace activity
        const team = teamsState.find(t => t.id === currentJob.teamId);
        if (team) {
          team.activityTimeline.unshift({
            timestamp: new Date().toISOString(),
            action: `Completed AI Training Pipeline (${currentJob.modelType})`,
            user: 'Vertex AI orchestrator'
          });
        }
        clearInterval(intervalId);
      }
    } else {
      clearInterval(intervalId);
    }
  }, 1500);

  res.json({ success: true, job });
});

// 8. Molecule candidates
app.get('/api/molecules', (req, res) => {
  res.json(moleculesState);
});

// Dynamic AI Molecule Generation using Gemini (or simulated algorithm)
app.post('/api/molecules/generate', async (req, res) => {
  const { teamId, targetProtein, diseaseId } = req.body;

  if (!teamId || !targetProtein || !diseaseId) {
    return res.status(400).json({ error: 'Missing teamId, targetProtein, or diseaseId.' });
  }

  const disease = diseasesState.find(d => d.id === diseaseId) || { name: 'Neuro-Degeneration' };

  let generatedMols: Partial<Molecule>[] = [
    {
      name: 'Q-BetaInhib-1',
      formula: 'C18H20F2N4O2',
      smile: 'CC1=C(C2=CC=CC=C2N1C(=O)O)C(F)(F)CN3CCN(CC3)C4=NC=NC=N4',
      drugLikeness: 86,
      confidence: 89,
      noveltyScore: 84,
      targetProtein,
      syntheticAccessibility: 78
    },
    {
      name: 'Q-Vertex-109',
      formula: 'C22H26N4O3S',
      smile: 'CN(C)CC1=CC=C(C=C1)S(=O)(=O)NC2=CC(=CC=C2)C3=CN=C(N3)C4CCNCC4',
      drugLikeness: 91,
      confidence: 93,
      noveltyScore: 92,
      targetProtein,
      syntheticAccessibility: 63
    }
  ];

  let wasRealAi = false;

  if (ai) {
    try {
      const prompt = `You are an AI-driven quantum chemist. Generate exactly 2 high-quality therapeutic molecule candidates designed to target protein "${targetProtein}" for disease context "${disease.name}".
      Provide highly accurate, scientifically plausible molecular formulas and real chemical SMILES representation string.
      
      Return a JSON array where each item matches this exact format:
      [
        {
          "name": string (creative drug-discovery name starting with "Q-"),
          "formula": string (chemical formula),
          "smile": string (chemical SMILES),
          "drugLikeness": number (0-100),
          "noveltyScore": number (0-100),
          "targetProtein": string,
          "syntheticAccessibility": number (0-100)
        }
      ]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (Array.isArray(parsed) && parsed.length > 0) {
          generatedMols = parsed;
          wasRealAi = true;
        }
      }
    } catch (err) {
      console.error('Gemini molecule generation failed, using mock molecule profiles:', err);
    }
  }

  const results: Molecule[] = generatedMols.map(m => {
    return {
      id: generateId('mol'),
      teamId,
      name: m.name || `Q-Gen-${Math.floor(Math.random() * 500)}`,
      formula: m.formula || 'C20H22N4O2',
      smile: m.smile || 'CC1=C(C)N=C(C)C=C1',
      drugLikeness: m.drugLikeness || 85,
      confidence: m.confidence || 90,
      noveltyScore: m.noveltyScore || 88,
      targetProtein: m.targetProtein || targetProtein,
      syntheticAccessibility: m.syntheticAccessibility || 70,
      status: 'Queued' // Will need quantum simulation
    };
  });

  moleculesState.push(...results);

  // Add workspace timeline entry
  const team = teamsState.find(t => t.id === teamId);
  if (team) {
    team.activityTimeline.unshift({
      timestamp: new Date().toISOString(),
      action: `Generated ${results.length} molecule candidates for ${targetProtein}`,
      user: 'Generative GNN Agent'
    });
  }

  res.json({
    success: true,
    wasRealAi,
    molecules: results
  });
});

// 9. Quantum Simulation Endpoint
app.post('/api/molecules/simulate', (req, res) => {
  const { moleculeId } = req.body;
  const mol = moleculesState.find(m => m.id === moleculeId);

  if (!mol) return res.status(404).json({ error: 'Molecule not found.' });

  mol.status = 'Running';

  // Background simulation progress
  setTimeout(() => {
    mol.status = 'Completed';
    mol.bindingAffinity = +(-6.5 - Math.random() * 5.5).toFixed(1); // kcal/mol
    mol.bindingEnergy = +(-0.15 - Math.random() * 0.45).toFixed(2); // eV
    mol.electronInteraction = Math.random() > 0.5 ? 'Significant d-orbital hybrid overlap' : 'Key hydrogen-bond ligand networks';
    mol.proteinStability = +(70 + Math.random() * 25).toFixed(0); // % stability
    mol.reactionProbability = +(60 + Math.random() * 35).toFixed(0); // % probability
    mol.quantumScore = +(75 + Math.random() * 23).toFixed(0); // 0-100

    // Check if it's excellent enough to trigger Candidate promotion candidate
    if (mol.quantumScore! >= 80 && mol.drugLikeness >= 80) {
      const team = teamsState.find(t => t.id === mol.teamId);
      const disease = team ? diseasesState.find(d => d.id === team.diseaseId) : null;
      
      const candidateExists = candidatesState.some(c => c.moleculeId === mol.id);
      if (!candidateExists) {
        const newCandidate: CandidateDrug = {
          id: generateId('can'),
          moleculeId: mol.id,
          moleculeName: mol.name,
          formula: mol.formula,
          teamId: mol.teamId,
          teamName: team ? team.teamName : 'Independent Guild',
          diseaseId: team ? team.diseaseId : 'dis-als',
          diseaseName: disease ? disease.name : 'Neuro-Degeneration',
          aiConfidence: mol.confidence,
          quantumScore: mol.quantumScore!,
          estimatedToxicity: Math.random() > 0.6 ? 'Low' : 'Very Low',
          estimatedCost: `$${(2.5 + Math.random() * 15).toFixed(2)} / dose`,
          manufacturingDifficulty: Math.random() > 0.5 ? 'Medium' : 'Low',
          lipinskiCompliance: 'Compliant',
          wetLabReady: true,
          status: 'Pending',
          comments: [
            {
              expertName: 'Quantum AI Ingestion Bot',
              vote: 'Approve',
              text: `Promoted automatically based on outstanding binding affinity (${mol.bindingAffinity} kcal/mol) and stability metrics.`,
              timestamp: new Date().toISOString()
            }
          ]
        };
        candidatesState.unshift(newCandidate);
      }
    }

    // Add activity timeline
    const team = teamsState.find(t => t.id === mol.teamId);
    if (team) {
      team.activityTimeline.unshift({
        timestamp: new Date().toISOString(),
        action: `Quantum Simulation Complete: ${mol.name} (Score: ${mol.quantumScore})`,
        user: 'Google Quantum Simulator Engine'
      });
    }

  }, 3000);

  res.json({ success: true, molecule: mol });
});

// 10. Candidates & Expert Review
app.get('/api/candidates', (req, res) => {
  res.json(candidatesState);
});

app.post('/api/candidates/vote', (req, res) => {
  const { candidateId, expertName, vote, commentText } = req.body;

  if (!candidateId || !expertName || !vote) {
    return res.status(400).json({ error: 'Missing review vote components.' });
  }

  const candidate = candidatesState.find(c => c.id === candidateId);
  if (!candidate) return res.status(404).json({ error: 'Candidate drug not found.' });

  candidate.comments.push({
    expertName,
    vote,
    text: commentText || 'No comments provided.',
    timestamp: new Date().toISOString()
  });

  // Calculate final status based on votes
  const approvals = candidate.comments.filter(c => c.vote === 'Approve').length;
  const rejections = candidate.comments.filter(c => c.vote === 'Reject').length;
  const revisions = candidate.comments.filter(c => c.vote === 'Revision').length;

  if (rejections > 1) {
    candidate.status = 'Rejected';
  } else if (revisions > 1) {
    candidate.status = 'Revision';
  } else if (approvals >= 3) {
    candidate.status = 'Approved';
  }

  res.json({ success: true, candidate });
});

// 11. Google Cloud Diagram Data
app.get('/api/architecture', (req, res) => {
  res.json(GOOGLE_CLOUD_ARCHITECTURE);
});


// ----------------------------------------------------
// DEV / PROD ASSET SERVING & INTEGRATION
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In development mode, load Vite server as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Running development server with Vite middleware.');
  } else {
    // In production mode, serve built files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static assets.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QureX Platform server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
