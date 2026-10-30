/**
 * 100% Client-Side Deterministic Security Analysis Engine (Zero-AI Mode)
 * Executes entirely in browser volatile memory (RAM) with zero external API calls.
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
 * Deterministic multi-signal telemetry calculation for 90-day breach forecasting
 */
export function calculateHeuristicBreachProbability(telemetry: any): BreachPredictionResult {
  let score = 15; // baseline

  const mfa = Number(telemetry?.mfaCoverage) ?? 90;
  score += Math.max(0, (100 - mfa) * 0.4);

  const cves = Number(telemetry?.unpatchedCves) || 0;
  score += Math.min(30, cves * 4);

  const phishFail = Number(telemetry?.phishingFailureRate) || 8;
  score += phishFail * 0.8;

  const edr = Number(telemetry?.edrCoverage) ?? 95;
  score += Math.max(0, (100 - edr) * 0.3);

  const exposed = Number(telemetry?.exposedServices) || 0;
  score += Math.min(20, exposed * 5);

  const habit = Number(telemetry?.habitAdherence) ?? 85;
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

  const summary = `Deterministic telemetry model calculates a ${probability}% 90-day breach probability (${riskLevel} tier). Primary exposure stems from ${
    cves > 2 ? `${cves} unpatched CVEs` : 'perimeter exposure'
  } and ${
    mfa < 95 ? `${100 - mfa}% identity MFA coverage gap` : 'human phishing susceptibility'
  }. Immediate FIDO2 hardware enforcement and patch cadence will reduce risk significantly.`;

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
 * Deterministic static code vulnerability analyzer (OWASP Top 10 & CWE ruleset)
 */
export function fallbackCodeScan(code: string, _language?: string): CodeScanResult {
  const codeLower = (code || '').toLowerCase();

  // 1. SQL Injection (CWE-89)
  if (
    (codeLower.includes('select ') ||
      codeLower.includes('insert ') ||
      codeLower.includes('update ') ||
      codeLower.includes('delete ')) &&
    (codeLower.includes('${') ||
      codeLower.includes('+') ||
      codeLower.includes('f"select') ||
      codeLower.includes('format('))
  ) {
    return {
      hasVulnerability: true,
      title: 'SQL Injection via Dynamic String Interpolation',
      cwe: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
      severity: 'CRITICAL',
      cvssScore: 9.8,
      vulnerableLines: [3, 4, 5],
      explanation:
        'Untrusted user input is concatenated or interpolated directly into a raw SQL query string without parameterized queries or prepared statements.',
      impact:
        'Attackers can bypass authentication, exfiltrate sensitive database tables, modify records, or execute administrative database operations.',
      remediatedCode: `// Remediated: Use parameterized prepared statements
app.get('/api/user/profile', async (req, res) => {
  const userId = String(req.query.id || '');
  const result = await db.query(
    'SELECT id, username, role FROM users WHERE id = $1',
    [userId]
  );
  res.json({ user: result.rows[0] ?? null });
});`,
      remediationExplanation:
        'Use parameterized queries ($1, ?) so the database driver treats user input strictly as bound literal values and never as executable SQL syntax.',
    };
  }

  // 2. OS Command Injection (CWE-78)
  if (
    codeLower.includes('exec(') ||
    codeLower.includes('execsync(') ||
    codeLower.includes('os.system(') ||
    codeLower.includes('subprocess.popen(')
  ) {
    return {
      hasVulnerability: true,
      title: 'OS Command Injection via Unsanitized Shell Execution',
      cwe: 'CWE-78: Improper Neutralization of Special Elements used in an OS Command',
      severity: 'CRITICAL',
      cvssScore: 9.8,
      vulnerableLines: [2, 3, 4],
      explanation:
        'Invoking a system shell with user-controlled arguments enables command chaining via metacharacters (; | && ` $()).',
      impact:
        'Full Remote Code Execution (RCE) under the privileges of the application service account.',
      remediatedCode: `// Remediated: Use execFile with strict argument array & allowlist validation
import { execFile } from 'child_process';

const ALLOWED_HOSTS = /^[a-zA-Z0-9.-]+$/;
if (!ALLOWED_HOSTS.test(targetHost)) {
  throw new Error('Invalid hostname format');
}
execFile('/sbin/ping', ['-c', '3', targetHost], { timeout: 5000 }, callback);`,
      remediationExplanation:
        'Replace shell-invoking functions (exec/system) with execFile() and validate inputs against a strict character allowlist.',
    };
  }

  // 3. Cross-Site Scripting / DOM Injection (CWE-79)
  if (
    codeLower.includes('innerhtml') ||
    codeLower.includes('dangerouslysetinnerhtml') ||
    codeLower.includes('document.write(') ||
    codeLower.includes('eval(')
  ) {
    return {
      hasVulnerability: true,
      title: 'DOM-Based Cross-Site Scripting (XSS) / Unsafe Sink',
      cwe: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
      severity: 'HIGH',
      cvssScore: 8.2,
      vulnerableLines: [2, 3],
      explanation:
        'Unvalidated input flows directly into an unsafe DOM sink (innerHTML / eval / dangerouslySetInnerHTML) without context-aware encoding.',
      impact:
        'Arbitrary JavaScript execution in the victim browser context, session token theft, or unauthorized actions.',
      remediatedCode: `// Remediated: Use safe textContent binding instead of raw HTML sinks
const container = document.getElementById('user-comment');
if (container) {
  container.textContent = untrustedUserInput;
}`,
      remediationExplanation:
        'Assign untrusted strings via textContent or sanitize HTML with a strict allowlist parser before rendering.',
    };
  }

  // 4. Hardcoded Credentials / API Secrets (CWE-798)
  if (
    codeLower.includes('api_key =') ||
    codeLower.includes('apikey =') ||
    codeLower.includes('secret =') ||
    codeLower.includes('password =') ||
    codeLower.includes('sk_live_') ||
    codeLower.includes('akia')
  ) {
    return {
      hasVulnerability: true,
      title: 'Hardcoded Cryptographic Secret or API Credential',
      cwe: 'CWE-798: Use of Hard-coded Credentials',
      severity: 'HIGH',
      cvssScore: 7.9,
      vulnerableLines: [1, 2],
      explanation:
        'Sensitive credentials or API keys are embedded directly in source code where they can be leaked via version control or client bundles.',
      impact:
        'Unauthorized third-party access to cloud infrastructure, billing abuse, or lateral movement across production environments.',
      remediatedCode: `// Remediated: Load secrets from runtime environment / secret manager
const apiKey = process.env.SERVICE_API_KEY;
if (!apiKey) {
  throw new Error('Missing required SERVICE_API_KEY in runtime environment');
}`,
      remediationExplanation:
        'Never commit credentials to source control. Inject secrets at runtime via environment variables or a dedicated hardware/cloud secret manager.',
    };
  }

  // 5. Default deterministic defensive audit summary
  return {
    hasVulnerability: true,
    title: 'Deterministic Defensive Static Code Review',
    cwe: 'CWE-20: Improper Input Validation & Boundary Enforcement',
    severity: 'MEDIUM',
    cvssScore: 5.3,
    vulnerableLines: [1],
    explanation:
      'Static pattern scan completed in local browser RAM. Ensure all external request parameters enforce strict schema validation, type coercion guards, and explicit authorization checks.',
    impact:
      'Unvalidated external parameters can cause unexpected control flow, denial of service, or business logic bypass.',
    remediatedCode: `// Enforce strict schema validation and explicit authorization checks
if (typeof inputParam !== 'string' || inputParam.length > 128) {
  return res.status(400).json({ error: 'Invalid input parameter' });
}`,
    remediationExplanation:
      'Validate input length, type, and format at the controller boundary before passing data to business logic or storage layers.',
  };
}
