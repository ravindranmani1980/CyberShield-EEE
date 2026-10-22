import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGemini: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// 1. ML Breach Prediction Endpoint
app.post('/api/predict-breach', async (req: Request, res: Response) => {
  try {
    const { telemetry } = req.body;
    if (!telemetry) {
      return res.status(400).json({ error: 'Telemetry data is required' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini AI service is not initialized' });
    }

    const prompt = `You are an elite predictive cybersecurity machine learning engine.
Analyze the following operational security telemetry and predict potential security breaches before they occur:
Telemetry:
- MFA Coverage: ${telemetry.mfaCoverage}%
- Unpatched Critical/High CVEs: ${telemetry.unpatchedCves}
- Employee Phishing Simulation Failure Rate: ${telemetry.phishingFailureRate}%
- EDR Agent Coverage: ${telemetry.edrCoverage}%
- Publicly Exposed Services / Shadow IT: ${telemetry.exposedServices}
- Security Audit & Routine Habit Adherence: ${telemetry.habitAdherence}%
- Dark Web Credential Mentions (past 30d): ${telemetry.darkWebMentions}
- Anomalous Off-Hours Logins: ${telemetry.anomalousLogins} / week

Predict:
1. 90-day breach probability (0 to 100 integer)
2. Risk level (LOW, MEDIUM, HIGH, CRITICAL)
3. Top 3 predicted breach attack vectors
4. Probable attack path (step-by-step kill chain: Initial Access -> Execution -> Persistence -> Lateral Movement -> Exfiltration)
5. Executive Threat Forecast summary (2-3 concise, actionable sentences)
6. 4 Prioritized mitigation recommendations

Return ONLY valid JSON with keys:
"probability" (number),
"riskLevel" (string: LOW, MEDIUM, HIGH, or CRITICAL),
"topVectors" (array of strings),
"attackPath" (array of strings),
"executiveSummary" (string),
"recommendations" (array of strings)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      isAiGenerated: true,
    });
  } catch (error: any) {
    console.error('Breach prediction error:', error);
    return res.status(500).json({ error: 'Failed to predict breach probability' });
  }
});

// 2. Email & Suspicious Link Analyzer Endpoint
app.post('/api/analyze-email', async (req: Request, res: Response) => {
  try {
    const { emailText, sender, subject, links, headers } = req.body;

    if (!ai) {
      const heuristic = analyzeEmailHeuristics(emailText, sender, subject, links);
      return res.json(heuristic);
    }

    const prompt = `You are a cybersecurity email threat triage engine.
Analyze the following email for phishing, malicious links, sender address spoofing, urgency extortion, OTP/PIN harvesting, and social engineering:
- Sender: "${sender || ''}"
- Subject: "${subject || ''}"
- Extracted Links: ${JSON.stringify(links || [])}
- Headers: "${headers || ''}"
- Body:
"""
${emailText || ''}
"""

Evaluate:
1. Threat Level (CLEAN, SUSPICIOUS, HIGH_RISK, or CRITICAL_MALICIOUS)
2. Overall Risk Score (0 to 100)
3. Specific red flags detected (typosquatting, lookalike domains, sender mismatch, urgency, OTP/credential request, hidden redirect)
4. Specific Link Analysis for each link found
5. Detailed explanation of the attack technique
6. Immediate recommendation for the recipient / SOC analyst

Return ONLY valid JSON with structure:
{
  "threatLevel": "CLEAN" | "SUSPICIOUS" | "HIGH_RISK" | "CRITICAL_MALICIOUS",
  "riskScore": number,
  "redFlags": string[],
  "linkAssessments": [
    { "url": string, "verdict": "SAFE" | "SUSPICIOUS" | "MALICIOUS", "reason": string }
  ],
  "techniqueAnalysis": string,
  "recommendations": string[]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Email analysis error:', error);
    const fallback = analyzeEmailHeuristics(
      req.body.emailText,
      req.body.sender,
      req.body.subject,
      req.body.links
    );
    return res.json(fallback);
  }
});

// 3. Hands-on Code Vulnerability Scanner Endpoint
app.post('/api/scan-code', async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini AI service is not initialized' });
    }

    const prompt = `You are an expert application security code auditor.
Review the following code defensively for security vulnerabilities (e.g. OWASP Top 10, CWE weaknesses, injection, broken auth, SSRF, insecure crypto, secrets exposure):
Language: ${language || 'javascript'}
Code:
\`\`\`
${code}
\`\`\`

Analyze:
1. Is there a vulnerability?
2. Vulnerability Name & CWE ID
3. Severity (LOW, MEDIUM, HIGH, CRITICAL) and estimated CVSS v3.1 score
4. Vulnerable line numbers (approximate 1-indexed)
5. Vulnerability explanation and potential exploitation impact (purely educational/defensive)
6. Secure Remediation: Show the fixed/remediated code and explain the defense-in-depth principles applied.

Return ONLY valid JSON with keys:
{
  "hasVulnerability": boolean,
  "title": string,
  "cwe": string,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "cvssScore": number,
  "vulnerableLines": number[],
  "explanation": string,
  "impact": string,
  "remediatedCode": string,
  "remediationExplanation": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Code scan error:', error);
    return res.status(500).json({ error: 'Failed to scan code with AI model' });
  }
});

// Heuristic email analyzer helper
function analyzeEmailHeuristics(emailText = '', sender = '', subject = '', links: string[] = []) {
  const flags: string[] = [];
  let score = 5;

  const textLower = (emailText + ' ' + subject + ' ' + sender).toLowerCase();

  // Suspicious keywords
  const urgentKeywords = ['urgent', 'immediate action', 'suspended', 'terminated within', 'expires in', 'unauthorized login', '24 hours'];
  const credentialKeywords = ['verify your password', 'confirm your otp', 'atm pin', 'enter pin', 'validate account', 'wire transfer', 'gift card', 'bitcoin'];

  urgentKeywords.forEach((kw) => {
    if (textLower.includes(kw)) {
      flags.push(`Urgency pressure tactic detected: "${kw}"`);
      score += 15;
    }
  });

  credentialKeywords.forEach((kw) => {
    if (textLower.includes(kw)) {
      flags.push(`Sensitive credential / financial request: "${kw}"`);
      score += 25;
    }
  });

  // Sender domain analysis
  if (sender) {
    if (/.*<.*>/.test(sender)) {
      const match = sender.match(/(.*?)\s*<([^>]+)>/);
      if (match) {
        const displayName = match[1].toLowerCase();
        const emailAddr = match[2].toLowerCase();
        if ((displayName.includes('microsoft') || displayName.includes('paypal') || displayName.includes('google') || displayName.includes('bank')) &&
            !emailAddr.includes('microsoft.com') && !emailAddr.includes('paypal.com') && !emailAddr.includes('google.com')) {
          flags.push(`Display Name Spoofing: claims to be "${match[1]}" but sender domain is "${emailAddr}"`);
          score += 40;
        }
      }
    }
    if (/[0-9]/.test(sender.split('@')[1] || '')) {
      flags.push('Sender domain contains numbers, potential typosquatting');
      score += 10;
    }
  }

  // Links inspection
  const linkAssessments = (links || []).map((url) => {
    const urlLower = url.toLowerCase();
    let verdict: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' = 'SAFE';
    let reason = 'Domain appears standard';

    if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(url)) {
      verdict = 'MALICIOUS';
      reason = 'Direct raw IP address destination used instead of registered domain name';
      score += 35;
    } else if (urlLower.includes('.xyz') || urlLower.includes('.top') || urlLower.includes('.zip') || urlLower.includes('.tk')) {
      verdict = 'SUSPICIOUS';
      reason = 'High-risk top-level domain frequently utilized in phishing operations';
      score += 20;
    } else if (urlLower.includes('login') || urlLower.includes('verify') || urlLower.includes('secure') || urlLower.includes('portal')) {
      if (!urlLower.includes('https://')) {
        verdict = 'MALICIOUS';
        reason = 'Unencrypted HTTP credential portal link';
        score += 30;
      } else {
        verdict = 'SUSPICIOUS';
        reason = 'Credential harvesting keyword in URL';
        score += 15;
      }
    }

    return { url, verdict, reason };
  });

  const riskScore = Math.min(100, Math.max(0, score));
  let threatLevel: 'CLEAN' | 'SUSPICIOUS' | 'HIGH_RISK' | 'CRITICAL_MALICIOUS' = 'CLEAN';
  if (riskScore >= 75) threatLevel = 'CRITICAL_MALICIOUS';
  else if (riskScore >= 50) threatLevel = 'HIGH_RISK';
  else if (riskScore >= 25) threatLevel = 'SUSPICIOUS';

  return {
    threatLevel,
    riskScore,
    redFlags: flags.length ? flags : ['No standard heuristic red flags detected'],
    linkAssessments,
    techniqueAnalysis: 'Heuristic engine scanned headers, link URLs, lookalike domains, and psychological manipulation keywords.',
    recommendations: riskScore > 40
      ? ['Do not click any embedded links', 'Do not provide OTP, PIN, or passwords', 'Report this email to security operations immediately']
      : ['Email appears normal; verify sender if request involves sensitive files'],
  };
}


// Setup Vite in development or static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (isProd || hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CyberShield Server] listening on http://0.0.0.0:${PORT} (env: ${isProd ? 'production' : 'development'}, static dist: ${hasDist})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
