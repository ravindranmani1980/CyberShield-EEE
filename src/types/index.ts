/**
 * Shared Type Definitions for CyberShield Suite
 */

// 1. E2EE Personal Vault Types
export interface HabitItem {
  id: string;
  title: string;
  category: 'threat_intel' | 'identity' | 'code_audit' | 'network' | 'health_opsec';
  cadence: 'daily' | 'weekly';
  description: string;
  completedDates: string[]; // ISO date string 'YYYY-MM-DD'
  streak: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface ProductivitySession {
  id: string;
  date: string; // 'YYYY-MM-DD'
  sessionType: 'threat_hunting' | 'incident_triage' | 'code_audit' | 'deep_work';
  durationMinutes: number;
  notes: string; // Zero-knowledge encrypted personal notes
}

export interface VaultCredentialItem {
  id: string;
  accountName: string; // e.g. "AWS Production Root", "GitHub Enterprise", "ProtonMail"
  usernameOrEmail: string;
  password: string; // Zero-knowledge AES-GCM encrypted in vault
  category: 'cloud' | 'work' | 'personal' | 'infrastructure' | 'keys';
  notes?: string;
  entropyBits: number;
  createdAt: string;
}

export interface EncryptedUserData {
  habits: HabitItem[];
  productivitySessions: ProductivitySession[];
  threatHuntingNotes: { id: string; title: string; content: string; date: string }[];
  storedCredentials: VaultCredentialItem[];
  vaultVersion: number;
  lastUpdated: string;
}

// 2. Email Scanner & Link Inspector Types
export interface LinkInspectionResult {
  url: string;
  verdict: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
  reason: string;
  detectedProtocols?: string;
  flags: string[];
}

export interface EmailScanResult {
  threatLevel: 'CLEAN' | 'SUSPICIOUS' | 'HIGH_RISK' | 'CRITICAL_MALICIOUS';
  riskScore: number; // 0 - 100
  redFlags: string[];
  linkAssessments: LinkInspectionResult[];
  techniqueAnalysis: string;
  recommendations: string[];
  senderDetails?: {
    rawFrom: string;
    parsedDisplayName?: string;
    parsedEmail?: string;
    domain: string;
    isSpoofed: boolean;
    hasHomoglyphs: boolean;
    replyToMismatch?: boolean;
    spfStatus?: 'PASS' | 'FAIL' | 'NONE';
    dmarcStatus?: 'PASS' | 'FAIL' | 'NONE';
  };
}

// 3. Phishing Campaign Simulation Types
export interface PhishingCampaign {
  id: string;
  name: string;
  targetDepartment: 'Finance' | 'Executive' | 'Engineering' | 'HR' | 'Sales' | 'All Staff';
  difficulty: 'Novice' | 'Intermediate' | 'Advanced' | 'Zero-Day Pretext';
  templateId: string;
  status: 'Draft' | 'Active' | 'Completed';
  createdAt: string;
  metrics: {
    emailsSent: number;
    opened: number;
    clickedLink: number;
    submittedCredentials: number;
    reportedPhish: number;
  };
}

export interface PhishingTemplate {
  id: string;
  name: string;
  category: 'Credential Harvest' | 'Malicious Attachment' | 'Executive Wire Fraud' | 'Urgent IT Alert';
  subject: string;
  senderName: string;
  senderAddress: string;
  bodyHtml: string;
  targetLandingBait: string;
  telltaleIndicators: string[];
}

// 4. Vulnerability Identification Lab Types
export interface VulnerabilityChallenge {
  id: string;
  title: string;
  language: 'typescript' | 'python' | 'go' | 'javascript';
  cwe: string;
  owaspCategory: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  cvssScore: number;
  scenarioDescription: string;
  codeSnippet: string;
  vulnerableLines: number[]; // 1-indexed
  explanation: string;
  impactAnalysis: string;
  remediatedCode: string;
  remediationExplanation: string;
}

// 5. Social Engineering & Vishing Scam Trainer Types
export interface VishingDialogueNode {
  id: string;
  callerStatement: string;
  psychologicalTrigger: 'Urgency' | 'Authority' | 'Fear' | 'Scarcity' | 'Sympathy';
  options: {
    text: string;
    isSafeResponse: boolean;
    feedback: string;
    scoreDelta: number;
    nextNodeId?: string;
  }[];
}

export interface VishingScenario {
  id: string;
  title: string;
  callerName: string;
  spoofedCallerId: string;
  callerRole: string;
  attackVector: 'OTP Theft' | 'ATM PIN & Wire Fraud' | 'IT Helpdesk Impersonation' | 'Extortion';
  scenarioContext: string;
  rootNodeId: string;
  dialogueTree: Record<string, VishingDialogueNode>;
  goldenTakeaway: string;
}

// 6. ML Breach Prediction Telemetry Types
export interface SecurityTelemetry {
  mfaCoverage: number; // 0-100%
  unpatchedCves: number; // count
  phishingFailureRate: number; // 0-100%
  edrCoverage: number; // 0-100%
  exposedServices: number; // count
  habitAdherence: number; // 0-100%
  darkWebMentions: number; // count
  anomalousLogins: number; // count per week
}

export interface BreachPredictionResult {
  probability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  topVectors: string[];
  attackPath: string[];
  executiveSummary: string;
  recommendations: string[];
  isAiGenerated: boolean;
}
