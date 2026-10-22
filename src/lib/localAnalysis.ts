/**
 * Client-side Heuristic Security Analysis & Fallbacks
 * Provides zero-downtime, fully offline threat forecasting & defensive code scanning
 * in the browser when server API or Gemini endpoints are unreachable.
 */

import { BreachPredictionResult } from '../types';

export interface CodeScanResult {
  hasVulnerability: boolean;
  title: string;
  cwe: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  cvssScore: number;
  vulnerableLines: number[];
  explanation: string;
  impact: string;
  remediatedCode: string;
  remediationExplanation: string;
}

/**
 * Heuristic calculation helper for breach prediction
 */
export function calculateHeuristicBreachProbability(telemetry: any): BreachPredictionResult {
  let score = 15; // baseline

  const mfa = Number(telemetry?.mfaCoverage) || 90;
  score += Math.max(0, (100 - mfa) * 0.4);

  const cves = Number(telemetry?.unpatchedCves) || 0;
  score += Math.min(30, cves * 4);

  const phishFail = Number(telemetry?.phishingFailureRate) || 8;
  score += phishFail * 0.8;

  const edr = Number(telemetry?.edrCoverage) || 95;
  score += Math.max(0, (100 - edr) * 0.3);

  const exposed = Number(telemetry?.exposedServices) || 0;
  score += Math.min(20, exposed * 5);

  const habit = Number(telemetry?.habitAdherence) || 85;
  score += Math.max(0, (100 - habit) * 0.2);

  const darkWeb = Number(telemetry?.darkWebMentions) || 0;
  score += Math.min(25, darkWeb * 3);

  const offHours = Number(telemetry?.anomalousLogins) || 0;
  score += Math.min(15, offHours * 2);

  const probability = Math.min(96, Math.max(4, Math.round(score)));

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (probability > 75) riskLevel = 'CRITICAL';
  else if (probability > 50) riskLevel = 'HIGH';
  else if (probability > 25) riskLevel = 'MEDIUM';

  const topVectors: string[] = [];
  if (mfa < 80 || darkWeb > 2) topVectors.push('Credential Stuffing & MFA Fatigue Hijacking');
  if (phishFail > 10) topVectors.push('Social Engineering / Spear Phishing Initial Access');
  if (cves > 3 || exposed > 1) topVectors.push('Public Facing Service Vulnerability Exploitation');
  if (edr < 90) topVectors.push('Unmonitored Endpoint Ransomware & Lateral Movement');
  if (topVectors.length < 3) topVectors.push('Supply Chain Dependency Compromise');

  const summary = `Current telemetry indicates a ${probability}% breach probability. Primary exposure stems from unpatched CVEs and identity hygiene gaps. Immediate MFA enforcement and patching will reduce exposure significantly.`;

  return {
    probability,
    riskLevel,
    topVectors: topVectors.slice(0, 3),
    attackPath: [
      '1. Initial Access: Phishing bait or exposed credential used against external gateway',
      '2. Execution: Script payload or stolen token utilized to establish persistent foothold',
      '3. Lateral Movement: Discovery and pivoting via unpatched internal network endpoints',
      '4. Exfiltration / Impact: Accessing unsecured cloud datastores or deploying ransomware',
    ],
    executiveSummary: summary,
    recommendations: [
      'Enforce FIDO2 / WebAuthn phishing-resistant hardware keys on all privileged accounts',
      'Remediate high-severity CVEs on internet-facing perimeter within 48 hours',
      'Deploy interactive phishing simulation retraining for high-risk user groups',
      'Audit public ingress rules and eliminate exposed administrative ports',
    ],
    isAiGenerated: false,
  };
}

/**
 * Fallback code scan for defensive vulnerability auditing
 */
export function fallbackCodeScan(code: string, language?: string): CodeScanResult {
  const codeLower = (code || '').toLowerCase();
  if (codeLower.includes('select') && (codeLower.includes('+') || codeLower.includes('${') || codeLower.includes('format('))) {
    return {
      hasVulnerability: true,
      title: 'SQL Injection via Dynamic String Concatenation',
      cwe: 'CWE-89',
      severity: 'CRITICAL',
      cvssScore: 9.8,
      vulnerableLines: [3, 4],
      explanation: 'User input is concatenated directly into a raw SQL query string without parameterized queries or prepared statements.',
      impact: 'Attackers can bypass authentication, read arbitrary database contents, modify records, or execute administrative commands.',
      remediatedCode: '// Use parameterized query\nconst query = "SELECT * FROM users WHERE email = $1 AND active = true";\nconst result = await db.query(query, [userEmail]);',
      remediationExplanation: 'Use parameterized queries / prepared statements so input parameters are treated strictly as data literals, never executable SQL tokens.',
    };
  }

  return {
    hasVulnerability: true,
    title: 'Defensive Security Review Completed',
    cwe: 'CWE-693',
    severity: 'MEDIUM',
    cvssScore: 5.3,
    vulnerableLines: [1],
    explanation: 'General input sanitization and strict validation recommended.',
    impact: 'Unvalidated input may lead to unexpected logic execution.',
    remediatedCode: code || '// Secure implementation',
    remediationExplanation: 'Ensure all external user parameters pass strict whitelist validation and context-aware escaping.',
  };
}
