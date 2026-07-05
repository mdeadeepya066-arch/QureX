import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, FileText, CheckCircle, Database, AlertCircle, Sparkles, Brain, Loader, Heart,
  Globe, Shield, ChevronDown, ChevronUp, Clock, Info, Check, Trash2, Calendar, FileDown, Activity, Plus
} from 'lucide-react';
import { Patient } from '../types';

interface PatientPortalProps {
  patients: Patient[];
  onAddPatient: (newPatient: Patient) => void;
  hasGeminiKey: boolean;
}

const PRELOADED_SAMPLE_REPORTS = [
  {
    name: "ALS Genetic Analysis - Eleanora V.",
    type: "Genetic Report" as const,
    hospital: "Mayo Clinic",
    country: "United States",
    text: "GENETIC SCREENING REPORT\nHospital: Mayo Clinic - Neurogenetics Lab\nPatient: Eleanora Vance, Age 34\nSymptoms presented: Rapidly progressing upper motor limb spasticity, heavy fasciculations, slurred speech.\nScreening Results:\n- Positive expansion detected in the C9orf72 chromosome 9 locus (G4C2 hexanucleotide repeat count > 45).\n- Detected heterozygous missense variant SOD1-A4V (c.11G>T) associated with hyper-aggressive progression.\nBlood: Normal blood parameters except mild increase in CRP to 1.2 mg/L.\nCurrent therapy: Riluzole 50mg BID."
  },
  {
    name: "GBM CT Scan & Pathology - Marcus B.",
    type: "CT Scan" as const,
    hospital: "Dana-Farber Cancer Institute",
    country: "United Kingdom",
    text: "CLINICAL PATHOLOGY & CT SCAN PREVIEW\nInstitution: Dana-Farber Cancer Institute\nPatient Name: Marcus Brody, Age: 58, Gender: Male\nComputed Tomography: Revels a large, heterogeneous, ring-enhancing mass in the right frontal lobe measuring 4.2cm with surrounding vasogenic edema.\nPathology & Genomics:\n- EGFRvIII Mutation: Amplified / Positive\n- MGMT Promoter Status: Unmethylated\n- IDH1 Staining: Wildtype (Negative)\nDiagnosis: Glioblastoma Multiforme (GBM) Staged IV.\nCurrent medication: Temozolomide 150mg/m2, Dexamethasone 4mg QD, Levetiracetam (Keppra) 500mg BID."
  },
  {
    name: "Alzheimer's Diagnostic & Blood - Arthur P.",
    type: "Medical History" as const,
    hospital: "Johns Hopkins Hospital",
    country: "Japan",
    text: "COGNITIVE ASSESSMENT & MOLECULAR METRICS\nHospital: Johns Hopkins Medicine\nPatient Name: Arthur Pendelton, Age: 62\nPresented with progressive amnestic cognitive decline, mild apraxia, and profound spatial disorientation.\nBiomarker Study:\n- Blood panel: elevated inflammatory C-reactive protein (CRP: 4.8 mg/L). Normal RBC & Hemoglobin.\n- Genotyping: APOE-ε4/ε4 Homozygous high risk configuration, TREM2-R47H variant positive.\nStaging: Moderate Alzheimer's Dementia (Stage III).\nPrevious treatments: Aducanumab trial discontinued due to amyloid-related imaging abnormalities (ARIA-E)."
  }
];

const COUNTRIES = [
  "Australia",
  "Brazil",
  "Canada",
  "France",
  "Germany",
  "India",
  "Japan",
  "Singapore",
  "Switzerland",
  "United Kingdom",
  "United States"
];

const UPLOAD_CONFIGS = {
  'Blood Report': {
    title: 'Blood Report',
    accept: '.pdf, .csv, .xlsx, .xls, .png, .jpg',
    placeholder: 'Upload Blood Report',
    desc: 'PDF, CSV, Excel or Images up to 20MB',
    mockText: (name: string, hosp: string, country: string) => `CLINICAL BLOOD ANALYSIS REPORT\nOriginating Facility: ${hosp || 'General Pathology Labs'}\nCountry: ${country}\nPatient Name: ${name}\nDate: ${new Date().toLocaleDateString()}\n\nTEST METRICS:\n- White Blood Cell (WBC): 8.4 K/uL [Normal range: 4.5 - 11.0]\n- Red Blood Cell (RBC): 4.8 M/uL [Normal range: 4.0 - 5.9]\n- Hemoglobin (HGB): 14.2 g/dL [Normal range: 12.0 - 17.5]\n- Platelet Count (PLT): 260 K/uL [Normal range: 150 - 450]\n- C-Reactive Protein (CRP): 4.8 mg/L [Normal range: < 3.0] (Above Normal)\n\nNotes: Elevated inflammation biomarker detected. All other cellular parameters reside within normal physiological ranges.`
  },
  'MRI': {
    title: 'MRI Scan',
    accept: '.dcm, .zip, .png, .jpg',
    placeholder: 'Upload MRI Scan',
    desc: 'DICOM, ZIP or Images up to 100MB',
    mockText: (name: string, hosp: string, country: string) => `BRAIN MRI SCAN REPORT\nFacility: ${hosp || 'Neuro-Imaging Center'}\nCountry: ${country}\nPatient Name: ${name}\nScans: T1-weighted, T2-FLAIR, and Post-Contrast Imaging\n\nFINDINGS:\nSymmetrical cerebral hemispheres. High-intensity lesion detected measuring approximately 2.8cm in the left temporal-parietal region, showing mild surrounding edema. No midline shift or ventricular compression.\nStaged as GBM Glioma Stage I/II candidate. IDH1 wildtype marker query suggested.`
  },
  'CT Scan': {
    title: 'CT Scan',
    accept: '.dcm, .zip, .png, .jpg',
    placeholder: 'Upload CT Scan',
    desc: 'DICOM, ZIP or Images up to 100MB',
    mockText: (name: string, hosp: string, country: string) => `COMPUTED TOMOGRAPHY (CT) ANALYSIS\nDepartment: ${hosp || 'Advanced Diagnostics Institute'}\nCountry: ${country}\nPatient Name: ${name}\nScan Area: Cranial & Thoracic\n\nSUMMARY:\nCT Scan reveals a large, heterogeneous, ring-enhancing mass in the right frontal lobe measuring 4.2cm with surrounding vasogenic edema. Surrounding brain parenchyma shows compression signs consistent with Stage IV Glioblastoma Multiforme (GBM).`
  },
  'X-Ray': {
    title: 'X-Ray Image',
    accept: '.dcm, .zip, .png, .jpg',
    placeholder: 'Upload X-Ray Images',
    desc: 'DICOM, ZIP or Images up to 25MB',
    mockText: (name: string, hosp: string, country: string) => `DIAGNOSTIC X-RAY REPORT\nHospital: ${hosp || 'Orthopaedic Center of Excellence'}\nCountry: ${country}\nPatient Name: ${name}\nViews: Chest PA & Lateral\n\nIMAGING FINDINGS:\nSlight hyperinflation of lung fields. Clear vascular markings. No focal consolidation or pleural effusion. Spondylopathic changes noted in the thoracic spine.`
  },
  'Genetic Report': {
    title: 'Genetic Report',
    accept: '.txt, .json, .fasta, .pdf',
    placeholder: 'Upload Genetic Report',
    desc: 'TXT, JSON, FASTA or PDF up to 15MB',
    mockText: (name: string, hosp: string, country: string) => `GENOMICS & GENETIC ANALYSIS EXOME SEQUENCING\nHospital: ${hosp || 'Center for Medical Genetics'}\nCountry: ${country}\nPatient: ${name}\nMethod: Next-Generation Whole Exome Sequencing\n\nMUTATIONAL ANALYSIS:\n- APOE ε4/e4 Homozygous high-risk configuration detected.\n- TREM2 R47H risk variant Positive.\n- Normal sequencing for amyloid precursor protein (APP) gene locus.\nConfidence evaluation: 97% sequence coverage.`
  },
  'Prescription': {
    title: 'Prescription',
    accept: '.pdf, .png, .jpg',
    placeholder: 'Upload Prescription',
    desc: 'PDF, PNG, JPEG up to 10MB',
    mockText: (name: string, hosp: string, country: string) => `OFFICIAL MEDICAL PRESCRIPTION SHEET\nClinic: ${hosp || 'Metropolitan Neurology Clinic'}\nCountry: ${country}\nPatient Name: ${name}\n\nACTIVE RX:\n1. Donepezil HCl 10mg QD\n   Dispense: 30 tablets (1-month supply)\n   Sig: Take 1 tablet orally at bedtime.\n2. Memantine HCl 20mg QD\n   Dispense: 30 tablets\n   Sig: Take 1 tablet daily with food.`
  },
  'Medical History': {
    title: 'Medical History',
    accept: '.pdf, .docx, .txt',
    placeholder: 'Upload Medical History',
    desc: 'PDF, DOCX or TXT up to 30MB',
    mockText: (name: string, hosp: string, country: string) => `LONGITUDINAL CLINICAL CHART SUMMARY\nSystem: ${hosp || 'Johns Hopkins Hospital'}\nCountry: ${country}\nPatient: ${name}\n\nTIMELINE & DIAGNOSTIC HISTORY:\n- 2022: Presented with mild amnestic cognitive impairment. Donepezil trial initiated.\n- 2024: Progressive memory loss, mild apraxia, spatial disorientation. Formal diagnosis of Moderate Alzheimer's Disease.\n- Current: Staged at Alzheimer's Stage III.`
  },
  'Symptoms': {
    title: 'Symptoms Note',
    accept: '.txt, .docx, .pdf',
    placeholder: 'Enter Symptoms or Upload Notes',
    desc: 'TXT, DOCX, PDF or manual entry up to 10MB',
    mockText: (name: string, hosp: string, country: string) => `CLINICAL SYMPTOM PROFILE NOTES\nFacility: ${hosp || 'Patient Intake Services'}\nCountry: ${country}\nPatient: ${name}\n\nOBSERVED PATHOLOGIES:\n- Progressive memory loss\n- Mild apraxia\n- Spatial disorientation\n- Cognitive decline\n- Elevated anxiety regarding daily routine displacement.`
  }
};

// Genetic Mutations Map to enrich mutation details
const getMutationDetails = (mutation: string) => {
  const m = mutation.toUpperCase().trim();
  if (m.includes('APOE') || m.includes('E4')) {
    return {
      name: mutation,
      significance: "High Alzheimer's Progression Risk",
      disease: "Alzheimer's Disease",
      importance: "Critical target for microglial lipid transport modulation and therapeutic clearing trials.",
      confidence: "97%"
    };
  }
  if (m.includes('SOD1')) {
    return {
      name: mutation,
      significance: "Hyper-aggressive motor neuron degeneration",
      disease: "Amyotrophic Lateral Sclerosis (ALS)",
      importance: "Direct target for modern antisense oligonucleotide therapies (e.g., Tofersen) blocking SOD1 translation.",
      confidence: "95%"
    };
  }
  if (m.includes('C9ORF72')) {
    return {
      name: mutation,
      significance: "Primary familial motor neuropathy etiology",
      disease: "Amyotrophic Lateral Sclerosis (ALS) & FTD",
      importance: "Key repeat expansion target for RNA-targeting therapies and nuclear transport defect studies.",
      confidence: "96%"
    };
  }
  if (m.includes('TREM2')) {
    return {
      name: mutation,
      significance: "Elevated microglial clearance dysfunction",
      disease: "Alzheimer's Disease / Neurodegeneration",
      importance: "Implicated in impaired phagocytosis of amyloid plaques. Primary target for immunotherapeutic agonists.",
      confidence: "93%"
    };
  }
  if (m.includes('F508DEL') || (m.includes('CFTR') && m.includes('508'))) {
    return {
      name: mutation,
      significance: "Class II folding defect (Premature ER degradation)",
      disease: "Cystic Fibrosis (Severe)",
      importance: "Primary therapeutic target for CFTR corrector molecules like Lumacaftor and Elexacaftor.",
      confidence: "98%"
    };
  }
  if (m.includes('G551D') || (m.includes('CFTR') && m.includes('551'))) {
    return {
      name: mutation,
      significance: "Class III ion channel gating defect (Closed channel state)",
      disease: "Cystic Fibrosis",
      importance: "Target for potentiator therapy (Ivacaftor / Kalydeco) to restore chloride transport efficiency.",
      confidence: "99%"
    };
  }
  if (m.includes('EGFR')) {
    return {
      name: mutation,
      significance: "Somatic oncogenic receptor amplification",
      disease: "Glioblastoma Multiforme (GBM)",
      importance: "Primary driver of fast proliferation. Highly active target in CAR-T trials and kinase inhibitors.",
      confidence: "96%"
    };
  }
  if (m.includes('MGMT')) {
    return {
      name: mutation,
      significance: "Temozolomide DNA repair chemorad-resistance",
      disease: "Glioblastoma Multiforme (GBM)",
      importance: "Determines responsiveness to standard alkylating chemotherapy; key criteria for trial design.",
      confidence: "94%"
    };
  }
  if (m.includes('IDH1')) {
    return {
      name: mutation,
      significance: "Isocitrate dehydrogenase somatic wildtype",
      disease: "Glioblastoma / Glioma",
      importance: "Critical marker for diagnostic staging, disease aggressiveness, and patient trial matching.",
      confidence: "95%"
    };
  }
  if (m.includes('TARDBP') || m.includes('TDP')) {
    return {
      name: mutation,
      significance: "TDP-43 hyper-aggregation etiology",
      disease: "Amyotrophic Lateral Sclerosis (ALS)",
      importance: "Focus of small-molecule trials preventing toxic cytoplasmic protein aggregation and splicing loss.",
      confidence: "92%"
    };
  }
  if (m.includes('HTT') || m.includes('CAG')) {
    return {
      name: mutation,
      significance: "Pathogenic polyglutamine CAG expansion confirm",
      disease: "Huntington's Disease",
      importance: "Target for allele-specific HTT knockdown using siRNA or CRISPR transcriptional inhibition.",
      confidence: "99%"
    };
  }
  if (m.includes('KRAS')) {
    return {
      name: mutation,
      significance: "Somatic GTPase signal lock driver",
      disease: "Pancreatic Ductal Adenocarcinoma",
      importance: "Target for highly selective novel small-molecule covalent inhibitors (e.g., G12D pipelines).",
      confidence: "97%"
    };
  }
  if (m.includes('TP53')) {
    return {
      name: mutation,
      significance: "Loss-of-function cell death suppressor",
      disease: "Pancreatic Ductal Adenocarcinoma / Oncology",
      importance: "Correlated with aggressive genome instability, extreme chemotherapy tolerance, and rapid staging.",
      confidence: "95%"
    };
  }
  if (m.includes('CDKN2A')) {
    return {
      name: mutation,
      significance: "Cell cycle restriction point escape driver",
      disease: "Pancreatic Ductal Adenocarcinoma",
      importance: "Potential candidate for synergistic combination therapies with CDK4/6 cell-cycle inhibitors.",
      confidence: "93%"
    };
  }
  return {
    name: mutation,
    significance: "Detected somatic/germline genomic variant under study",
    disease: "Associated pathological pathways",
    importance: "Eligible for clinical trial cohort mapping and structural molecular docking studies.",
    confidence: "90%"
  };
};

// Medication Map to enrich dosing & purposes
const getMedicationDetails = (medText: string) => {
  let name = medText;
  let dose = "As prescribed";
  
  const doseMatch = medText.match(/((\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|u|units|tabs|tablets|caps|capsules|pkg|pack|tablets|BID|TID|QID|QD|PRN|HS|Daily|with meals|AM|PM|with food)?\s*(?:BID|TID|QID|QD|PRN|HS|Daily|with meals|AM|PM|with food)?))/i);
  if (doseMatch) {
    dose = doseMatch[1].trim();
    name = medText.replace(doseMatch[1], '').trim().replace(/,$/, '').trim();
    if (!name) name = medText;
  }

  let purpose = "Therapeutic disease management";
  const nameLower = name.toLowerCase();
  if (nameLower.includes('riluzole')) purpose = "Glutamate release inhibitor to slow ALS motor decline";
  else if (nameLower.includes('baclofen')) purpose = "GABA-B receptor agonist to resolve motor spasticity";
  else if (nameLower.includes('donepezil')) purpose = "Cholinesterase inhibitor for temporary memory stabilization";
  else if (nameLower.includes('memantine')) purpose = "NMDA receptor antagonist to protect against excitotoxicity";
  else if (nameLower.includes('trikafta') || nameLower.includes('elexacaftor')) purpose = "CFTR triple corrector/potentiator to rescue protein folding";
  else if (nameLower.includes('tobramycin')) purpose = "Nebulized antibiotic targeting chronic lung pathogens";
  else if (nameLower.includes('pancrelipase') || nameLower.includes('creon')) purpose = "Pancreatic lipase replacement therapy for malabsorption";
  else if (nameLower.includes('temozolomide')) purpose = "Alkylating chemotherapy agent inhibiting tumor cell division";
  else if (nameLower.includes('dexamethasone')) purpose = "Glucocorticoid to manage tumor-associated vasogenic brain edema";
  else if (nameLower.includes('keppra') || nameLower.includes('levetiracetam')) purpose = "Anticonvulsant to prevent tumor-associated cerebral seizures";
  else if (nameLower.includes('deutetrabenazine')) purpose = "VMAT2 inhibitor to dampen hyperkinetic choreic movements";
  else if (nameLower.includes('sertraline')) purpose = "Selective serotonin reuptake inhibitor for reactive depression";
  else if (nameLower.includes('oxycodone')) purpose = "Mu-opioid receptor agonist for critical severe cancer pain relief";
  else if (nameLower.includes('radicava') || nameLower.includes('edaravone')) purpose = "Free radical scavenger to minimize neural oxidative stress";
  else if (nameLower.includes('tizanidine')) purpose = "Alpha-2 adrenergic agonist for relieving severe spinal spasms";

  return { name, dose, purpose };
};

// Timeline Map based on patient diagnosis & stage
const getTimelineEvents = (patient: Patient) => {
  const diag = patient.diagnosis || "Undergoing Evaluation";
  const stage = patient.diseaseStage || "Stage II";
  
  if (diag.includes('Alzheimer')) {
    return [
      { year: "2024", title: "Mild Cognitive Impairment (MCI)", desc: "Patient presented with subtle amnestic lapses, word-finding friction, and early apraxia." },
      { year: "2025", title: "Moderate Alzheimer's", desc: "Formal diagnostic transition. Severe memory gaps and disorientation validated by PET amyloid tracer imaging." },
      { year: "Current", title: `Active Staging: ${stage}`, desc: "Under management with therapeutic enzyme inhibitors and molecular target trial pathways." }
    ];
  }
  if (diag.includes('Amyotrophic') || diag.includes('ALS')) {
    return [
      { year: "2024", title: "Initial Upper Limb Spasticity", desc: "Presented with minor hand muscle fatigue, progressive cramps, and asymmetric limb fasciculations." },
      { year: "2025", title: "ALS Confirmation & Riluzole", desc: "Confirmed diagnosis via electromyography (EMG). SOD1 genetic screening initiated." },
      { year: "Current", title: `Active Staging: ${stage}`, desc: `Symptom tracking under standard disease control. Currently at ${patient.hospital || "Clinical Facility"}.` }
    ];
  }
  if (diag.includes('Glioblastoma') || diag.includes('GBM')) {
    return [
      { year: "2024", title: "New-Onset Seizure Episode", desc: "Cerebral CT scans revealed a ring-enhancing 4.2cm mass in the right frontal lobe with vasogenic edema." },
      { year: "2025", title: "Subtotal Resection & Chemorad", desc: "Surgical intervention followed by standard Temozolomide and standard external beam radiotherapy (60 Gy)." },
      { year: "Current", title: `Active Staging: ${stage}`, desc: "Active surveillance with monthly MRI scans and continuous adjuvant seizure prophylaxis." }
    ];
  }
  if (diag.includes('Cystic') || diag.includes('CF')) {
    return [
      { year: "Early Childhood", title: "Gastrointestinal & Lung Symptoms", desc: "Diagnosed with standard sweat chloride testing. Pancreatic enzyme replacement started." },
      { year: "2024", title: "Pulmonary Deterioration", desc: "Exacerbated chronic lung infections and obstructive dysfunction Staging." },
      { year: "Current", title: `Active Staging: ${stage}`, desc: "CFTR multi-corrective chaperone regimen (Trikafta) introduced to manage long-term respiratory metrics." }
    ];
  }
  if (diag.includes('Huntington')) {
    return [
      { year: "2023", title: "Initial Cognitive & Affective Shifts", desc: "Unexplained changes in executive control, progressive mood volatility, and minor motor ticks." },
      { year: "2024", title: "Choreic Movement Onset", desc: "Formal CAG repeat screening confirms 46 expansion repeats in HTT gene. Choreatic therapeutics introduced." },
      { year: "Current", title: `Active Staging: ${stage}`, desc: "Continuous motor stabilization under specialist multidisciplinary neurogenetics clinic." }
    ];
  }
  if (diag.includes('Pancreatic')) {
    return [
      { year: "2024", title: "Jaundice & Weight Loss", desc: "Onset of painless icterus, substantial weight loss, and severe radiating mid-back pain." },
      { year: "2025", title: "Inoperable Staging", desc: "CT scans and fine-needle biopsy confirm KRAS mutant pancreatic adenocarcinoma." },
      { year: "Current", title: `Active Staging: ${stage}`, desc: "Advanced supportive pain management and active chemotherapy protocol trials." }
    ];
  }
  return [
    { year: "2 Years Ago", title: "Symptomatic Onset", desc: "Patient presented with initial non-specific clinical anomalies and fatigue." },
    { year: "1 Year Ago", title: "Diagnostic Confirmation", desc: `Formal diagnosis of ${diag} confirmed via molecular screenings.` },
    { year: "Current", title: `Active Staging: ${stage}`, desc: `Sustained monitoring of cellular and molecular biomarkers under clinical trials.` }
  ];
};

export default function PatientPortal({ patients, onAddPatient, hasGeminiKey }: PatientPortalProps) {
  const [patientName, setPatientName] = useState('');
  const [recordType, setRecordType] = useState<Patient['recordType']>('Blood Report');
  const [hospital, setHospital] = useState('');
  const [rawText, setRawText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedPatient, setExtractedPatient] = useState<Patient | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [wasRealAi, setWasRealAi] = useState(false);

  // New States for Changes 2 & 3
  const [country, setCountry] = useState('United States');
  const [countryQuery, setCountryQuery] = useState('United States');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; progress: number; isSuccess: boolean } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize with a default preloaded patient overview from patients prop if available
  useEffect(() => {
    if (patients && patients.length > 0 && !extractedPatient) {
      setExtractedPatient(patients[0]);
    }
  }, [patients]);

  // Click outside listener for country dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectPreset = (preset: typeof PRELOADED_SAMPLE_REPORTS[number]) => {
    const extractedName = preset.name.split(' - ')[1].replace('.', '');
    setPatientName(extractedName);
    setRecordType(preset.type);
    setHospital(preset.hospital);
    setCountry(preset.country);
    setCountryQuery(preset.country);
    setRawText(preset.text);
    setUploadedFile({
      name: `${preset.name.replace(/\s+/g, '_').toLowerCase()}.pdf`,
      size: '2.4 MB',
      progress: 100,
      isSuccess: true
    });
    setExtractedPatient(null);
  };

  const simulateFileUpload = (fileName: string, fileSize: number) => {
    setUploadedFile({
      name: fileName,
      size: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
      progress: 0,
      isSuccess: false
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setUploadedFile(prev => {
        if (!prev) return null;
        if (currentProgress >= 100) {
          clearInterval(interval);
          // Auto-seed raw clinical text once file upload is successful
          const selectedConfig = UPLOAD_CONFIGS[recordType];
          if (selectedConfig && !rawText) {
            setRawText(selectedConfig.mockText(patientName || "Jane Doe", hospital || "Stanford Health Care", country));
          }
          return { ...prev, progress: 100, isSuccess: true };
        }
        return { ...prev, progress: currentProgress };
      });
    }, 150);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      simulateFileUpload(file.name, file.size);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulateFileUpload(file.name, file.size);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMsg('Please specify a patient name.');
      return;
    }
    if (!country.trim()) {
      setErrorMsg('Please specify a country.');
      return;
    }
    setErrorMsg('');
    setIsUploading(true);
    setUploadProgress(10);

    const progressInterval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return p + 15;
      });
    }, 150);

    // If text to parse is empty but we have a mock configuration, seed it
    const activeText = rawText || UPLOAD_CONFIGS[recordType]?.mockText(patientName, hospital, country);

    try {
      const res = await fetch('/api/patients/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: patientName,
          recordType,
          hospital: hospital || 'Memorial Health',
          country,
          rawText: activeText
        })
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) throw new Error('Failed to extract patient clinical metadata.');
      const data = await res.json();
      
      setTimeout(() => {
        setExtractedPatient(data.patient);
        setWasRealAi(data.wasRealAi);
        onAddPatient(data.patient);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err: any) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      setErrorMsg(err.message || 'An error occurred during report parsing.');
    }
  };

  // Filter countries for autocomplete
  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(countryQuery.toLowerCase())
  );

  // Setup blood ranges status checkers
  const getBloodStatus = (param: string, value: number) => {
    switch (param) {
      case 'WBC':
        if (value < 4.5) return { status: 'Low', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        if (value > 11.0) return { status: 'High', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
        return { status: 'Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'RBC':
        if (value < 4.0) return { status: 'Low', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        if (value > 5.9) return { status: 'High', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
        return { status: 'Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'HGB':
        if (value < 12.0) return { status: 'Low', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        if (value > 17.5) return { status: 'High', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
        return { status: 'Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'PLT':
        if (value < 150) return { status: 'Low', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        if (value > 450) return { status: 'High', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
        return { status: 'Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'CRP':
        if (value >= 3.0) return { status: 'Above Normal', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 font-bold' };
        return { status: 'Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      default:
        return { status: 'Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    }
  };

  // Determine suitability status
  const getSuitability = (patient: Patient, category: string) => {
    const hasMutations = patient.geneMutations && patient.geneMutations.length > 0 && patient.geneMutations[0] !== 'Unknown Variant';
    const isALS = (patient.diagnosis || '').includes('ALS') || (patient.diagnosis || '').includes('Amyotrophic');
    
    switch (category) {
      case 'Disease Clustering':
        return { status: 'Eligible', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'Biomarker Discovery':
        return hasMutations 
          ? { status: 'Eligible', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
          : { status: 'Possibly Eligible', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'AI Training Dataset':
        return patient.confidenceScore >= 90
          ? { status: 'Eligible', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
          : { status: 'Possibly Eligible', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'Drug Discovery':
        return hasMutations
          ? { status: 'Eligible', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
          : { status: 'Possibly Eligible', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'Clinical Research':
        return { status: 'Eligible', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      default:
        return { status: 'Eligible', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    }
  };

  // Get dynamic recommendations
  const getRecommendations = (patient: Patient) => {
    const diag = patient.diagnosis || '';
    const hasMutations = patient.geneMutations && patient.geneMutations.length > 0 && patient.geneMutations[0] !== 'Unknown Variant';
    const firstMut = hasMutations ? patient.geneMutations[0] : '';
    
    const recs = [
      `Enlist patient as active candidate for therapeutic clinical trial design based on diagnostic confirmation of ${diag}.`,
      `Track inflammatory profiles closely, specifically evaluating C-Reactive Protein (CRP) markers showing a level of ${patient.bloodParameters?.crp} mg/L.`
    ];

    if (hasMutations) {
      recs.push(`Prioritize inclusion in standard genomic sub-cohort targeting the detected ${firstMut} variant sequence.`);
    } else {
      recs.push(`Schedule complete next-generation whole exome sequencing (WES) to capture secondary genetic targets.`);
    }

    return recs;
  };

  const uploadConfig = UPLOAD_CONFIGS[recordType] || UPLOAD_CONFIGS['Blood Report'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Upload Column */}
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" /> Patient Data Ingestion
            </h2>
            <p className="text-xs text-slate-400">Upload medical files, scans, or raw pathology reports into the secure research database.</p>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Sample Clinical Reports</span>
            <div id="patient-presets-grid" className="grid grid-cols-1 gap-2">
              {PRELOADED_SAMPLE_REPORTS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="p-3 text-left border border-slate-800 rounded-xl hover:bg-slate-800/40 hover:border-blue-500/40 transition-all flex items-center gap-3 cursor-pointer group bg-slate-900/30 text-slate-300"
                >
                  <FileText className="w-5 h-5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                  <div className="truncate flex-1">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">{preset.name}</div>
                    <div className="text-[10px] text-slate-400">{preset.type} • {preset.hospital}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-850" />

          {/* Form */}
          <form id="upload-patient-form" onSubmit={handleManualUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Patient Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-sm border border-slate-800 bg-[#0b0e14] text-white p-2.5 rounded-xl focus:border-blue-500 focus:outline-hidden transition-colors font-medium"
                  required
                />
              </div>

              {/* CHANGE 3: Searchable country autocomplete inside the Form */}
              <div className="space-y-1 relative" ref={countryDropdownRef}>
                <label className="text-xs font-bold text-slate-400">Country of Origin</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search or type country..."
                    value={countryQuery}
                    onChange={(e) => {
                      setCountryQuery(e.target.value);
                      setCountry(e.target.value);
                      setShowCountryDropdown(true);
                    }}
                    onFocus={() => setShowCountryDropdown(true)}
                    className="w-full text-sm border border-slate-800 bg-[#0b0e14] text-white p-2.5 rounded-xl focus:border-blue-500 focus:outline-hidden transition-colors font-medium pr-8"
                    required
                  />
                  <Globe className="w-4 h-4 text-slate-500 absolute right-2.5 top-3" />
                </div>
                {showCountryDropdown && filteredCountries.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-[#161b22] border border-slate-800 rounded-xl shadow-2xl max-h-40 overflow-y-auto divide-y divide-slate-850 text-xs">
                    {filteredCountries.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCountry(c);
                          setCountryQuery(c);
                          setShowCountryDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Medical Record Type</label>
                <select
                  value={recordType}
                  onChange={(e) => {
                    const val = e.target.value as Patient['recordType'];
                    setRecordType(val);
                    // Clear file on switch to prevent confusion
                    setUploadedFile(null);
                  }}
                  className="w-full text-sm border border-slate-800 bg-[#0b0e14] text-white p-2.5 rounded-xl focus:border-blue-500 focus:outline-hidden transition-colors font-medium cursor-pointer"
                >
                  <option value="Blood Report">Blood Report</option>
                  <option value="MRI">MRI Scan</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="X-Ray">X-Ray Image</option>
                  <option value="Genetic Report">Genetic Report</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Medical History">Medical History</option>
                  <option value="Symptoms">Symptoms & Intake Notes</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Originating Medical Facility</label>
                <input
                  type="text"
                  placeholder="e.g. Mayo Clinic"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full text-sm border border-slate-800 bg-[#0b0e14] text-white p-2.5 rounded-xl focus:border-blue-500 focus:outline-hidden transition-colors font-medium"
                  required
                />
              </div>
            </div>

            {/* CHANGE 2: Dynamic Upload Area Sensitive to Selected Record Type */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400">Ingestion Attachment</span>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (!uploadedFile) fileInputRef.current?.click();
                }}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                  uploadedFile 
                    ? 'border-emerald-500/40 bg-emerald-500/5' 
                    : isDragOver
                      ? 'border-blue-500 bg-blue-500/5'
                      : 'border-slate-800 bg-[#0b0e14] hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={uploadConfig.accept}
                  className="hidden"
                />

                <AnimatePresence mode="wait">
                  {uploadedFile ? (
                    <motion.div
                      key="file-uploaded-state"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full space-y-3"
                      onClick={(e) => e.stopPropagation()} // Stop triggering file select
                    >
                      <div className="flex items-center justify-between bg-[#161b22] border border-slate-800 rounded-xl p-3">
                        <div className="flex items-center gap-3 truncate">
                          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                            <Check className="w-5 h-5" />
                          </div>
                          <div className="text-left truncate">
                            <p className="text-xs font-bold text-white truncate">{uploadedFile.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{uploadedFile.size} • Ingestion Ready</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Replace File"
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            title="Remove File"
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-rose-400 hover:text-rose-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* simulated progress bar */}
                      {!uploadedFile.isSuccess && (
                        <div className="space-y-1 text-left">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Ingesting metadata streams...</span>
                            <span>{uploadedFile.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full transition-all duration-150" style={{ width: `${uploadedFile.progress}%` }} />
                          </div>
                        </div>
                      )}

                      {uploadedFile.isSuccess && (
                        <div className="text-[10px] text-emerald-400 font-medium flex items-center justify-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-lg">
                          <CheckCircle className="w-3.5 h-3.5" /> Clinical records locked and parsed in-memory.
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="file-empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-1.5"
                    >
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-full inline-flex text-blue-400 mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">
                          Drag & Drop or <span className="text-blue-400">Browse Files</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {uploadConfig.title} ({uploadConfig.desc})
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400">Raw Medical Text / Transcription</label>
                <span className="text-[10px] text-slate-500 font-medium">Automatic fallback parsing</span>
              </div>
              <textarea
                placeholder="Paste blood levels, gene analysis mutations, or imaging notes here..."
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full text-xs border border-slate-800 bg-[#0b0e14] text-white p-2.5 rounded-xl focus:border-blue-500 focus:outline-hidden font-mono transition-colors"
              />
            </div>

            {errorMsg && (
              <div className="p-3 text-xs text-red-400 bg-red-950/20 border border-red-900/50 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {errorMsg}
              </div>
            )}

            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><Loader className="w-3.5 h-3.5 animate-spin" /> Deep Clinical parsing via Gemini...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <button
              id="btn-upload-patient"
              type="submit"
              disabled={isUploading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              <Upload className="w-4 h-4" /> {isUploading ? 'Extracting Clinical Data...' : 'Submit & Run AI Extraction'}
            </button>
          </form>
        </div>

        {/* Security Indicator */}
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-emerald-400">HIPAA Compliant Ingestion Vault</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Records are filtered to strip personal identifiers before being piped into Google Cloud Storage and BigQuery, satisfying patient privacy guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Extraction Output Column - CHANGE 1: EHR-friendly Clinical Research Dashboard */}
      <div className="xl:col-span-7">
        <AnimatePresence mode="wait">
          {extractedPatient ? (
            <motion.div
              key="extracted-display"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              {/* Main Visual Clinical EHR Card */}
              <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full filter blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl -z-10" />

                {/* Dashboard Title & Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md inline-flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> EHR Clinical Summary
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-md inline-flex items-center gap-1">
                        ID: {extractedPatient.id}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{extractedPatient.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Processed: {new Date(extractedPatient.uploadedAt || new Date()).toLocaleDateString()} {new Date(extractedPatient.uploadedAt || new Date()).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-[#0b0e14] border border-slate-800 p-3 rounded-2xl">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">AI Score</span>
                      <span className="text-xs text-slate-400">Confidence</span>
                    </div>
                    <div className="text-3xl font-extrabold text-blue-400 tracking-tighter relative flex items-center justify-center font-mono">
                      {extractedPatient.confidenceScore}%
                    </div>
                  </div>
                </div>

                {/* Patient Overview */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-400" /> Patient Overview
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#0b0e14] border border-slate-850 p-4 rounded-2xl text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Age / Gender</span>
                      <span className="font-bold text-slate-200">{extractedPatient.age} Years • {extractedPatient.gender}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Country</span>
                      <span className="font-bold text-slate-200 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-blue-400" /> {extractedPatient.country || 'United States'}
                      </span>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Facility</span>
                      <span className="font-bold text-slate-200 truncate block">{extractedPatient.hospital}</span>
                    </div>
                    <div className="space-y-1 col-span-2 border-t border-slate-850/50 pt-2.5 mt-1">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Primary Diagnosis</span>
                      <span className="font-bold text-blue-400 block">{extractedPatient.diagnosis}</span>
                    </div>
                    <div className="space-y-1 border-t border-slate-850/50 pt-2.5 mt-1">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Stage</span>
                      <span className="font-bold text-purple-400 block font-mono">{extractedPatient.diseaseStage}</span>
                    </div>
                    <div className="space-y-1 border-t border-slate-850/50 pt-2.5 mt-1">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Record Type</span>
                      <span className="font-bold text-slate-300 block">{extractedPatient.recordType}</span>
                    </div>
                  </div>
                </div>

                {/* Clinical Summary */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-purple-400" /> Clinical Summary
                  </h4>
                  <div className="p-4 bg-blue-950/20 border-l-4 border-blue-500 rounded-r-2xl text-xs text-slate-200 leading-relaxed italic font-medium">
                    "{extractedPatient.clinicalSummary || `The uploaded clinical report details a ${extractedPatient.age}-year-old patient diagnosed with ${extractedPatient.diagnosis || 'Undiagnosed pathology'}. Analysis of standard biomarkers shows custom metrics requiring specialist clinical matching.`}"
                  </div>
                </div>

                {/* Blood Report Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-400" /> Blood Report Summary
                    </h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clinical Reference Ranges</span>
                  </div>
                  
                  {extractedPatient.bloodParameters ? (
                    <div className="border border-slate-850 rounded-2xl overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#0b0e14] border-b border-slate-850 text-slate-500 uppercase text-[9px] font-bold tracking-wider">
                            <th className="p-3">Biomarker</th>
                            <th className="p-3">Standard Reference Range</th>
                            <th className="p-3 text-right">Detected Value</th>
                            <th className="p-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/50 text-slate-300">
                          {Object.entries({
                            WBC: { val: extractedPatient.bloodParameters.wbc, ref: '4.5 - 11.0 K/uL' },
                            RBC: { val: extractedPatient.bloodParameters.rbc, ref: '4.0 - 5.9 M/uL' },
                            HGB: { val: extractedPatient.bloodParameters.hemoglobin, ref: '12.0 - 17.5 g/dL' },
                            PLT: { val: extractedPatient.bloodParameters.platelets, ref: '150 - 450 K/uL' },
                            CRP: { val: extractedPatient.bloodParameters.crp, ref: '< 3.0 mg/L' }
                          }).map(([key, data]) => {
                            const statusData = getBloodStatus(key, data.val);
                            return (
                              <tr key={key} className="hover:bg-slate-800/20 transition-colors">
                                <td className="p-3 font-bold text-white">{key}</td>
                                <td className="p-3 text-slate-500 font-mono text-[11px]">{data.ref}</td>
                                <td className="p-3 text-right font-mono font-bold text-slate-200">{data.val}</td>
                                <td className="p-3 text-right">
                                  <span className={`px-2 py-0.5 rounded text-[9px] border font-bold ${statusData.color}`}>
                                    {statusData.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 border border-slate-850 rounded-2xl bg-[#0b0e14]">
                      No metabolic blood parameters extracted.
                    </div>
                  )}
                </div>

                {/* Genetic Findings */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-purple-400" /> Genomic Profile & Target Variants
                  </h4>
                  {extractedPatient.geneMutations && extractedPatient.geneMutations.length > 0 && extractedPatient.geneMutations[0] !== 'Unknown Variant' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {extractedPatient.geneMutations.map((mutation) => {
                        const details = getMutationDetails(mutation);
                        return (
                          <div key={mutation} className="p-4 bg-[#0b0e14] border border-slate-850 rounded-2xl space-y-2 hover:border-slate-800 transition-colors">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                                {details.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold font-mono">CONFIDENCE {details.confidence}</span>
                            </div>
                            <div className="space-y-0.5">
                              <h5 className="text-[11px] font-bold text-slate-200">{details.significance}</h5>
                              <p className="text-[10px] text-slate-400">Context: {details.disease}</p>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">{details.importance}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 border border-slate-850 rounded-2xl bg-[#0b0e14]">
                      No target genomic mutations or splicing variants detected.
                    </div>
                  )}
                </div>

                {/* Medical History Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-400" /> Longitudinal Clinical History
                  </h4>
                  <div className="bg-[#0b0e14] border border-slate-850 p-5 rounded-2xl space-y-4 relative">
                    <div className="absolute left-7 top-6 bottom-6 w-0.5 bg-slate-850" />
                    {getTimelineEvents(extractedPatient).map((ev, idx) => (
                      <div key={idx} className="flex gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-[#0b0e14] flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                            {ev.year}
                          </span>
                          <h5 className="text-xs font-bold text-slate-200">{ev.title}</h5>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{ev.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Identified Symptoms */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-400" /> Identified Symptoms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedPatient.symptoms && extractedPatient.symptoms.length > 0 ? (
                      extractedPatient.symptoms.map((sym) => (
                        <span
                          key={sym}
                          className="px-3 py-1.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 border border-rose-500/10 hover:border-rose-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Check className="w-3.5 h-3.5 text-rose-400" /> {sym}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-xs italic">No clinical symptoms specified.</span>
                    )}
                  </div>
                </div>

                {/* Current & Prior Medications */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-emerald-400" /> Therapeutic & Prior Regimen
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {extractedPatient.currentMedicines && extractedPatient.currentMedicines.length > 0 ? (
                      extractedPatient.currentMedicines.map((med) => {
                        const medDetails = getMedicationDetails(med);
                        return (
                          <div key={med} className="p-3.5 bg-[#0b0e14] border border-slate-850 rounded-2xl flex flex-col justify-between space-y-2">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active Therapy</span>
                              <h5 className="text-xs font-extrabold text-white leading-snug">{medDetails.name}</h5>
                              <p className="text-[10px] font-mono text-slate-500 font-medium">Dosage: {medDetails.dose}</p>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal border-t border-slate-850/50 pt-2 font-sans">{medDetails.purpose}</p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-slate-500 border border-slate-850 rounded-2xl bg-[#0b0e14] col-span-2">
                        No active prescriptions detected.
                      </div>
                    )}

                    {extractedPatient.previousTreatments && extractedPatient.previousTreatments.length > 0 && (
                      <div className="p-3.5 bg-slate-900/30 border border-slate-850/60 rounded-2xl col-span-2 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discontinued/Prior Trials</span>
                        <div className="flex flex-wrap gap-2">
                          {extractedPatient.previousTreatments.map((t) => (
                            <span key={t} className="px-2.5 py-1 bg-slate-850 border border-slate-800 rounded-lg text-[10px] text-slate-500 font-medium line-through decoration-slate-600">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Key Findings */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400" /> AI Key Findings
                  </h4>
                  <div className="grid grid-cols-2 gap-3 bg-[#0b0e14] border border-slate-850 p-4 rounded-2xl text-[11px] leading-relaxed">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold block text-[9px] uppercase tracking-wider">Top Biomarkers</span>
                      <span className="text-slate-200 font-medium font-mono">{extractedPatient.geneMutations?.[0] || 'Unconfirmed'} (Genomics), CRP (Serum)</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold block text-[9px] uppercase tracking-wider">Clinical Severity</span>
                      <span className="text-rose-400 font-bold">{extractedPatient.diseaseStage || 'High-Risk Progressive'}</span>
                    </div>
                    <div className="space-y-1 col-span-2 border-t border-slate-850/50 pt-2.5 mt-1">
                      <span className="text-slate-500 font-bold block text-[9px] uppercase tracking-wider">Pathology Findings</span>
                      <span className="text-slate-300">Correlated multi-system molecular indicators suggest targeting {extractedPatient.diagnosis?.replace('Disease', '')} metabolic pathways.</span>
                    </div>
                    <div className="space-y-1 col-span-2 border-t border-slate-850/50 pt-2.5 mt-1">
                      <span className="text-slate-500 font-bold block text-[9px] uppercase tracking-wider">Research Recommendation</span>
                      <span className="text-blue-400 font-bold block">Recommended inclusion in standard clinical trial staging.</span>
                    </div>
                  </div>
                </div>

                {/* Research Suitability Metric Matrix */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-400" /> Discovery Research Suitability
                  </h4>
                  <div className="border border-slate-850 rounded-2xl overflow-hidden text-xs bg-[#0b0e14] divide-y divide-slate-850">
                    {[
                      'Disease Clustering',
                      'Biomarker Discovery',
                      'AI Training Dataset',
                      'Drug Discovery',
                      'Clinical Research'
                    ].map((cat) => {
                      const suit = getSuitability(extractedPatient, cat);
                      return (
                        <div key={cat} className="p-3 flex justify-between items-center hover:bg-slate-800/10 transition-colors">
                          <span className="font-bold text-slate-200">{cat}</span>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${suit.color}`}>
                            {suit.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommendations Bullet Points */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Discovery Recommendations
                  </h4>
                  <ul className="space-y-2 bg-blue-950/10 border border-blue-900/20 p-4 rounded-2xl text-xs text-slate-300">
                    {getRecommendations(extractedPatient).map((rec, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start">
                        <span className="text-blue-400 shrink-0 font-bold">✦</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Collapsible Developer/API JSON - Accordion style */}
              <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <button
                  type="button"
                  onClick={() => setShowJson(!showJson)}
                  className="w-full px-6 py-4 flex justify-between items-center bg-[#0b0e14]/50 hover:bg-[#0b0e14] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Developer / API JSON</span>
                  </div>
                  {showJson ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                <AnimatePresence>
                  {showJson && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-slate-850"
                    >
                      <div className="p-4 bg-[#0b0e14]">
                        <pre className="text-[10px] font-mono leading-relaxed text-slate-300 overflow-x-auto max-h-72 p-2 bg-slate-950/50 rounded-xl border border-slate-900">
                          {extractedPatient.structuredJson}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty-display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full bg-[#11151c]/40 rounded-3xl p-12 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="p-4 rounded-2xl bg-[#161b22] shadow-xl border border-slate-800 text-slate-500">
                <Brain className="w-12 h-12 text-blue-400" />
              </div>
              <div className="max-w-sm space-y-2">
                <h3 className="font-bold text-slate-300 text-lg">AI Report Extractor Ready</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select a clinical report preset or input manual records to trigger the Gemini parsing pipeline and structure biomarker records.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Adding missing interface field for our specific helper usage
interface ClipboardListProps extends React.SVGProps<SVGSVGElement> {}
const ClipboardList: React.FC<ClipboardListProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);
