export interface SecurityTip {
  id: string;
  title: string;
  category:
    | 'Identity & Access'
    | 'Zero-Trust Network'
    | 'AppSec & Code'
    | 'Phishing & OpSec'
    | 'Cloud Hardening'
    | 'Endpoint Defense';
  impactLevel: 'CRITICAL' | 'HIGH' | 'ESSENTIAL';
  summary: string;
  actionableStep: string;
  frameworkRef: string;
}

export const SECURITY_TIPS: SecurityTip[] = [
  {
    id: 'tip-fido2-passkeys',
    title: 'Replace SMS & Push MFA with Phishing-Resistant FIDO2 Passkeys',
    category: 'Identity & Access',
    impactLevel: 'CRITICAL',
    summary:
      'Attacker-in-the-Middle (AiTM) reverse proxy toolkits (like Evilginx) routinely intercept TOTP codes and trigger MFA push fatigue. Cryptographic FIDO2/WebAuthn security keys bind authentication to the exact browser origin domain.',
    actionableStep:
      'Audit privileged identity providers (AWS, GitHub, Google Workspace, Okta) and enforce WebAuthn/FIDO2 hardware keys or device-bound passkeys while disabling SMS/voice fallback.',
    frameworkRef: 'NIST SP 800-63B AAL3 / MITRE D3-MFA',
  },
  {
    id: 'tip-git-secret-scanning',
    title: 'Enforce Pre-Commit Secret Scanning Across Local Repositories',
    category: 'AppSec & Code',
    impactLevel: 'CRITICAL',
    summary:
      'Once an API key, database URI, or cloud token is committed to Git history, simply deleting the line in a later commit does not erase it from the reflog or public clone history.',
    actionableStep:
      'Configure pre-commit hooks using gitleaks or trufflehog in your local engineering environment, and rotate any token immediately if accidentally staged.',
    frameworkRef: 'OWASP Top 10 A07 / CWE-798',
  },
  {
    id: 'tip-egress-filtering',
    title: 'Restrict Outbound Egress Traffic & Audit DNS Queries',
    category: 'Zero-Trust Network',
    impactLevel: 'HIGH',
    summary:
      'Most firewalls strictly filter inbound traffic while allowing unrestricted outbound connections—giving malware and reverse shells a free channel to contact Command & Control (C2) servers.',
    actionableStep:
      'Implement default-deny outbound firewall rules on production workloads, whitelist required package registries/APIs, and enforce DNS-over-HTTPS (DoH) inspection via your secure resolver.',
    frameworkRef: 'MITRE ATT&CK TA0011 (Command and Control)',
  },
  {
    id: 'tip-vishing-out-of-band',
    title: 'Establish Out-of-Band Verification for Urgent Financial or OTP Requests',
    category: 'Phishing & OpSec',
    impactLevel: 'CRITICAL',
    summary:
      'Caller ID spoofing and real-time voice cloning allow social engineers to impersonate bank fraud departments, executives, or IT helpdesks under artificial urgency.',
    actionableStep:
      'Never read out an OTP, ATM PIN, or approve an urgent wire transfer on an inbound call. Hang up and call back using a verified number from an official directory or card back.',
    frameworkRef: 'CISA Social Engineering Defense Guide',
  },
  {
    id: 'tip-cloud-imds-v2',
    title: 'Enforce IMDSv2 on Cloud Compute Instances to Block SSRF Token Theft',
    category: 'Cloud Hardening',
    impactLevel: 'HIGH',
    summary:
      'Server-Side Request Forgery (SSRF) vulnerabilities frequently target cloud metadata endpoints (169.254.169.254) to exfiltrate temporary IAM role credentials.',
    actionableStep:
      'Mandate session-oriented Instance Metadata Service v2 (IMDSv2) requiring PUT requests with a TTL token header, and set hop limit to 1 for containerized workloads.',
    frameworkRef: 'CIS AWS Foundations Benchmark 5.6',
  },
  {
    id: 'tip-least-privilege-iam',
    title: 'Eliminate Standing Admin Privileges with Just-In-Time (JIT) Access',
    category: 'Identity & Access',
    impactLevel: 'HIGH',
    summary:
      'Standing administrative permissions maximize blast radius if an engineer workstation or session cookie is compromised.',
    actionableStep:
      'Use separate non-privileged accounts for daily work and require time-bound, peer-approved elevation for production infrastructure access.',
    frameworkRef: 'NIST SP 800-207 (Zero Trust Architecture)',
  },
  {
    id: 'tip-dependency-lockfiles',
    title: 'Pin Transitive Dependencies and Verify Package Integrity Hashes',
    category: 'AppSec & Code',
    impactLevel: 'HIGH',
    summary:
      'Supply-chain attacks exploit typosquatted packages and unpinned minor version ranges to execute malicious post-install scripts during CI/CD builds.',
    actionableStep:
      'Use deterministic builds (`npm ci --ignore-scripts` where feasible), commit lockfiles, and review Software Bill of Materials (SBOM) alerts daily.',
    frameworkRef: 'SLSA Level 3 / OWASP A06:2021',
  },
  {
    id: 'tip-browser-isolation',
    title: 'Isolate High-Risk Admin Consoles in Dedicated Browser Profiles',
    category: 'Endpoint Defense',
    impactLevel: 'ESSENTIAL',
    summary:
      'Malicious third-party browser extensions and session-riding scripts in general browsing tabs can read DOM data or hijack active cloud console sessions.',
    actionableStep:
      'Maintain a dedicated, extension-free browser profile exclusively for cloud administration, production dashboards, and password vault operations.',
    frameworkRef: 'ANSSI / NSA Endpoint Hardening Guidance',
  },
  {
    id: 'tip-parameterized-queries',
    title: 'Enforce Parameterized Queries & Strict Input Schema Validation',
    category: 'AppSec & Code',
    impactLevel: 'CRITICAL',
    summary:
      'String concatenation or template literal interpolation inside SQL, NoSQL, or OS command calls allows attackers to alter query structure and dump sensitive data.',
    actionableStep:
      'Audit API controllers to ensure all user inputs are validated against strict schemas (e.g., Zod) and passed exclusively as bound parameters.',
    frameworkRef: 'CWE-89 / OWASP Injection Prevention',
  },
  {
    id: 'tip-immutable-backups',
    title: 'Verify Offline & Immutable Backups Against Ransomware Encryption',
    category: 'Cloud Hardening',
    impactLevel: 'CRITICAL',
    summary:
      'Modern ransomware operators target connected backup repositories and shadow copies before encrypting primary production volumes.',
    actionableStep:
      'Configure Object Lock (WORM - Write Once Read Many) on backup buckets and run a monthly automated restoration drill into an isolated sandbox.',
    frameworkRef: 'NIST Cybersecurity Framework PR.IP-4',
  },
];

/**
 * Deterministically picks the daily tip for a given YYYY-MM-DD date string,
 * while also supporting randomized selection excluding the current tip.
 */
export function getDailySecurityTip(dateStr?: string): SecurityTip {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < targetDate.length; i++) {
    hash = (hash * 31 + targetDate.charCodeAt(i)) >>> 0;
  }
  const index = hash % SECURITY_TIPS.length;
  return SECURITY_TIPS[index];
}

export function getRandomSecurityTip(excludeId?: string): SecurityTip {
  const candidates = excludeId
    ? SECURITY_TIPS.filter((t) => t.id !== excludeId)
    : SECURITY_TIPS;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] || SECURITY_TIPS[0];
}
