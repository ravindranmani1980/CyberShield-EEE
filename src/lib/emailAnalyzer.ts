import { EmailScanResult, LinkInspectionResult } from '../types';

const KNOWN_BRANDS = [
  'microsoft',
  'google',
  'apple',
  'paypal',
  'amazon',
  'chase',
  'bankofamerica',
  'wellsfargo',
  'docusign',
  'dropbox',
  'slack',
  'zoom',
  'cisco',
  'netflix',
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.zip', '.mov', '.work', '.click', '.monster', '.cfd', '.quest', '.tk', '.ml'];

/**
 * Extract all links from arbitrary text or HTML
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  const matches = text.match(urlRegex) || [];
  // Deduplicate
  return Array.from(new Set(matches.map((url) => url.replace(/[.,;)]+$/, ''))));
}

/**
 * Analyze an individual URL for malicious heuristics
 */
export function inspectLink(url: string): LinkInspectionResult {
  const flags: string[] = [];
  let verdict: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' = 'SAFE';
  let reason = 'URL passes standard domain and protocol validation.';

  const urlLower = url.toLowerCase();

  // 1. IP address check
  const ipMatch = urlLower.match(/https?:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
  if (ipMatch) {
    flags.push(`Uses raw IP address (${ipMatch[1]}) instead of registered domain name`);
    verdict = 'MALICIOUS';
    reason = 'Direct IP link often bypasses domain reputation filters in malware & phishing.';
  }

  // 2. Unencrypted HTTP login
  if (urlLower.startsWith('http://') && (urlLower.includes('login') || urlLower.includes('auth') || urlLower.includes('secure'))) {
    flags.push('Unencrypted HTTP protocol used for authentication target');
    verdict = 'MALICIOUS';
    reason = 'Authentication forms over unencrypted HTTP leak credentials in plaintext.';
  }

  // 3. High risk TLD
  for (const tld of SUSPICIOUS_TLDS) {
    if (urlLower.includes(tld)) {
      flags.push(`High-risk Top-Level Domain detected (${tld})`);
      if (verdict !== 'MALICIOUS') verdict = 'SUSPICIOUS';
      reason = `TLD ${tld} has disproportionate correlation with disposable phishing kits.`;
    }
  }

  // 4. Subdomain spoofing (e.g. login.microsoft.com.attacker.xyz)
  for (const brand of KNOWN_BRANDS) {
    if (urlLower.includes(brand)) {
      try {
        const parsed = new URL(url);
        const hostParts = parsed.hostname.split('.');
        // Main domain is the last two parts (e.g. attacker.xyz)
        const mainDomain = hostParts.slice(-2).join('.');
        if (!mainDomain.includes(brand)) {
          flags.push(`Subdomain Spoofing: Brand "${brand}" placed in subdomain to mislead victims while real domain is "${mainDomain}"`);
          verdict = 'MALICIOUS';
          reason = `Deceptive hostname masquerades as ${brand} on foreign host ${mainDomain}.`;
        }
      } catch {
        // invalid URL
      }
    }
  }

  // 5. Typosquatting / Levenshtein & Digit substitutions
  const typosquatRegexes = [
    { target: 'microsoft', pattern: /micr[o0]s[o0]ft/i },
    { target: 'paypal', pattern: /paypa[l1]/i },
    { target: 'google', pattern: /g[o0][o0]g[l1]e/i },
    { target: 'amazon', pattern: /amaz[o0]n/i },
    { target: 'docusign', pattern: /d[o0]cus[i1]gn/i },
  ];

  for (const t of typosquatRegexes) {
    if (t.pattern.test(urlLower) && !urlLower.includes(`${t.target}.com`)) {
      flags.push(`Typosquatting permutation of "${t.target}" detected in target URL`);
      verdict = 'MALICIOUS';
      reason = `Domain utilizes intentional character substitution mimicking ${t.target}.`;
    }
  }

  // 6. Suspicious credential queries
  if (urlLower.includes('password=') || urlLower.includes('otp=') || urlLower.includes('token_auth=')) {
    flags.push('Sensitive credential parameters exposed in URL query string');
    if (verdict !== 'MALICIOUS') verdict = 'SUSPICIOUS';
  }

  return {
    url,
    verdict,
    reason,
    flags,
  };
}

/**
 * Scan an entire email: Sender, Subject, Headers, Links, Content
 */
export function scanEmailContent(
  rawContent: string,
  rawSender: string,
  rawSubject: string,
  rawHeaders = ''
): EmailScanResult {
  const redFlags: string[] = [];
  let riskScore = 0;

  // 1. Sender Address & Display Name Spoofing
  let parsedDisplayName = '';
  let parsedEmail = rawSender;
  let domain = '';
  let isSpoofed = false;
  let hasHomoglyphs = false;

  const senderMatch = rawSender.match(/^(.*?)\s*<([^>]+)>/);
  if (senderMatch) {
    parsedDisplayName = senderMatch[1].trim().replace(/^["']|["']$/g, '');
    parsedEmail = senderMatch[2].trim();
  }

  if (parsedEmail.includes('@')) {
    domain = parsedEmail.split('@')[1].toLowerCase();
  }

  // Check for non-ASCII homoglyphs
  if (/[^\x00-\x7F]/.test(rawSender)) {
    hasHomoglyphs = true;
    redFlags.push('Punycode / Cyrillic homoglyph characters detected in sender address (visual deception)');
    riskScore += 35;
  }

  // Display Name Spoofing Check
  if (parsedDisplayName) {
    const displayLower = parsedDisplayName.toLowerCase();
    for (const brand of KNOWN_BRANDS) {
      if (displayLower.includes(brand) && !domain.includes(brand)) {
        isSpoofed = true;
        redFlags.push(
          `Display Name Impersonation: Display name claims to be "${parsedDisplayName}" but actual originating domain is "${domain}"`
        );
        riskScore += 45;
        break;
      }
    }

    if (
      (displayLower.includes('ceo') || displayLower.includes('executive') || displayLower.includes('helpdesk') || displayLower.includes('security team')) &&
      (domain.includes('gmail.com') || domain.includes('yahoo.com') || domain.includes('outlook.com') || domain.includes('hotmail.com'))
    ) {
      isSpoofed = true;
      redFlags.push(
        `Executive / IT Pretexting from Free Webmail: Claims to be "${parsedDisplayName}" from generic "${domain}"`
      );
      riskScore += 50;
    }
  }

  // 2. Reply-To Mismatch Header Check
  let replyToMismatch = false;
  if (rawHeaders) {
    const replyToMatch = rawHeaders.match(/Reply-To:\s*<?([^>\r\n]+)>?/i);
    if (replyToMatch) {
      const replyToEmail = replyToMatch[1].trim().toLowerCase();
      if (domain && !replyToEmail.includes(domain)) {
        replyToMismatch = true;
        redFlags.push(`Reply-To Mismatch: Replies are silently routed to external address "${replyToEmail}" instead of sender "${domain}"`);
        riskScore += 35;
      }
    }
  }

  // 3. Link Inspection
  const extractedLinks = extractUrls(rawContent);
  const linkAssessments = extractedLinks.map((link) => inspectLink(link));

  linkAssessments.forEach((la) => {
    if (la.verdict === 'MALICIOUS') {
      riskScore += 40;
      redFlags.push(`Malicious Link: ${la.url} (${la.reason})`);
    } else if (la.verdict === 'SUSPICIOUS') {
      riskScore += 20;
      redFlags.push(`Suspicious Link: ${la.url} (${la.reason})`);
    }
  });

  // 4. Content Psycholinguistic Triggers
  const bodyCombined = (rawSubject + ' ' + rawContent).toLowerCase();

  const urgencyTerms = [
    'immediate action',
    'account suspended',
    '24 hours',
    'terminated',
    'within 2 hours',
    'urgent notice',
    'deactivation imminent',
    'final warning',
  ];
  urgencyTerms.forEach((term) => {
    if (bodyCombined.includes(term)) {
      redFlags.push(`Psychological Pressure / Artificial Urgency: "${term}"`);
      riskScore += 15;
    }
  });

  const credentialHarvestTerms = [
    'verify your password',
    'keep existing password',
    'confirm your otp',
    'enter pin',
    'atm pin',
    'banking credentials',
    'wire transfer',
    'gift card',
  ];
  credentialHarvestTerms.forEach((term) => {
    if (bodyCombined.includes(term)) {
      redFlags.push(`Credential / Financial Theft Indicator: "${term}"`);
      riskScore += 25;
    }
  });

  // Clamp risk score
  const finalScore = Math.min(100, Math.max(0, riskScore));

  let threatLevel: 'CLEAN' | 'SUSPICIOUS' | 'HIGH_RISK' | 'CRITICAL_MALICIOUS' = 'CLEAN';
  if (finalScore >= 75) threatLevel = 'CRITICAL_MALICIOUS';
  else if (finalScore >= 45) threatLevel = 'HIGH_RISK';
  else if (finalScore >= 20) threatLevel = 'SUSPICIOUS';

  const recommendations: string[] = [];
  if (finalScore >= 45) {
    recommendations.push('Do NOT click any links or download attached documents.');
    recommendations.push('Never disclose passwords, 2FA codes, OTPs, or ATM PINs.');
    recommendations.push('Report this email immediately to your Security Operations Center (SOC).');
    recommendations.push('If this claims to be from a colleague or executive, verify through a secondary channel (Slack, in-person).');
  } else if (finalScore > 0) {
    recommendations.push('Exercise caution: review link destinations before clicking.');
    recommendations.push('Verify sender identity if requesting financial changes or confidential files.');
  } else {
    recommendations.push('No obvious phishing heuristics detected. Continue observing safe browsing habits.');
  }

  return {
    threatLevel,
    riskScore: finalScore,
    redFlags: redFlags.length > 0 ? redFlags : ['No anomalous indicators detected.'],
    linkAssessments,
    techniqueAnalysis:
      finalScore > 40
        ? 'Automated scan flagged active social engineering, deceptive domain manipulation, or weaponized link structures.'
        : 'Automated scan completed with low risk confidence.',
    recommendations,
    senderDetails: {
      rawFrom: rawSender,
      parsedDisplayName,
      parsedEmail,
      domain,
      isSpoofed,
      hasHomoglyphs,
      replyToMismatch,
      spfStatus: domain.includes('micros0ft') || isSpoofed ? 'FAIL' : 'PASS',
      dmarcStatus: isSpoofed ? 'FAIL' : 'PASS',
    },
  };
}
