import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Mail,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Link as LinkIcon,
  Search,
  XCircle,
  Sparkles,
  RefreshCw,
  FileText,
  Volume2,
  VolumeX,
  BellRing,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { scanEmailContent } from '../lib/emailAnalyzer';
import { EmailScanResult } from '../types';

interface DailyThreatTelemetryPoint {
  dayLabel: string;
  dateIso: string;
  credentialPhishing: number;
  becSpoofing: number;
  headerAuthFail: number;
  maliciousLinks: number;
}

function buildInitial30DayTelemetry(): DailyThreatTelemetryPoint[] {
  const points: DailyThreatTelemetryPoint[] = [];
  const now = new Date();
  for (let offset = 29; offset >= 0; offset--) {
    const d = new Date(now.getTime() - offset * 86400000);
    const month = d.toLocaleString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    const seed = (offset * 17 + dayNum * 7) % 11;

    points.push({
      dayLabel: offset === 0 ? 'Today' : `${month} ${dayNum}`,
      dateIso: d.toISOString().split('T')[0],
      credentialPhishing: 2 + (seed % 5) + (offset % 6 === 0 ? 3 : 0),
      becSpoofing: 1 + ((seed + 2) % 4) + (offset % 8 === 0 ? 2 : 0),
      headerAuthFail: 2 + ((seed + 4) % 5),
      maliciousLinks: 1 + ((seed + 1) % 5) + (offset % 5 === 0 ? 2 : 0),
    });
  }
  return points;
}

const SAMPLE_EMAILS = [
  {
    id: 'sample-m365-phish',
    title: 'Microsoft 365 Password Expiry (Typosquat & Malicious Link)',
    sender: 'Microsoft Online Support <security-update@micros0ft-passkey.xyz>',
    subject: 'URGENT: Single Sign-On Credentials Terminate in 2 Hours',
    headers: `Received: from mail-gateway.outbound-phish.net (198.51.100.45)
From: "Microsoft Online Support" <security-update@micros0ft-passkey.xyz>
Reply-To: phish-collector@disposable-inbox.biz
Subject: URGENT: Single Sign-On Credentials Terminate in 2 Hours
Authentication-Results: spf=fail; dmarc=fail`,
    body: `Dear Corporate User,

Your enterprise Microsoft 365 password will expire today in accordance with our organizational security policy.

To retain your existing password and prevent account suspension, please authenticate via the secure synchronization portal immediately:

https://login.micros0ft-passkey.xyz/auth/verify?session=92841

Failure to verify within 120 minutes will result in your corporate account and mailbox being permanently locked.

Regards,
Global Microsoft Cloud Administrator`,
  },
  {
    id: 'sample-ceo-spoof',
    sender: 'Tim Cook (Chief Executive Officer) <t.cook.ceo@freemail-direct.com>',
    title: 'Executive Wire Transfer Fraud (Display Name Spoof & Mismatch)',
    subject: 'CONFIDENTIAL: Emergency Acquisition Wire Instructions',
    headers: `From: "Tim Cook (Chief Executive Officer)" <t.cook.ceo@freemail-direct.com>
Reply-To: executive-wire-escrow@mule-finance.org
Subject: CONFIDENTIAL: Emergency Acquisition Wire Instructions`,
    body: `Are you currently at your desk?

We have an urgent transaction closing this morning for strategic IP acquisition. I am in back-to-back confidential discussions with legal counsel and cannot answer calls.

Please wire $64,200 immediately to the escrow account details below:
http://192.168.1.185/escrow-invoice.pdf

Send me the wire transfer receipt as soon as the funds are queued.

Sent from my iPhone`,
  },
  {
    id: 'sample-docusign-legit',
    title: 'Legitimate Corporate DocuSign Notification (Clean Baseline)',
    sender: 'DocuSign System <dse@docusign.net>',
    subject: 'Please DocuSign: 2026 Vendor Mutual NDA',
    headers: `From: "DocuSign System" <dse@docusign.net>
Reply-To: dse@docusign.net
Authentication-Results: spf=pass; dkim=pass; dmarc=pass`,
    body: `ACME Cyber Corp has sent you a document to review and sign.

Please review the Mutual Non-Disclosure Agreement at:
https://na4.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=a12b3c4d

DocuSign Inc. · 221 Main St, San Francisco, CA`,
  },
  {
    id: 'sample-paypal-fake',
    title: 'PayPal Unauthorized Charge Phish (Fake Phone & Urgent Link)',
    sender: 'PayPal Security Center <billing-notice@paypa1-fraud-dept.top>',
    subject: 'Fraud Alert: You paid $789.99 to Coinbase Inc.',
    headers: `From: "PayPal Security Center" <billing-notice@paypa1-fraud-dept.top>
Reply-To: billing-notice@paypa1-fraud-dept.top
Authentication-Results: spf=fail`,
    body: `Dear Customer,

You sent a payment of $789.99 USD to Coinbase Crypto Holdings.

If you did not make this transaction, cancel this payment immediately to request an instant refund:
https://chase-paypal.verify-auth-portal.top/dispute

Or call our 24/7 fraud dispute desk immediately at +1-800-555-0199.`,
  },
];

export const EmailScanner: React.FC = () => {
  const [selectedSampleId, setSelectedSampleId] = useState('sample-m365-phish');
  const [senderInput, setSenderInput] = useState(SAMPLE_EMAILS[0].sender);
  const [subjectInput, setSubjectInput] = useState(SAMPLE_EMAILS[0].subject);
  const [headersInput, setHeadersInput] = useState(SAMPLE_EMAILS[0].headers);
  const [bodyInput, setBodyInput] = useState(SAMPLE_EMAILS[0].body);

  // Scan state
  const [scanResult, setScanResult] = useState<EmailScanResult | null>(null);
  const [isScanningLocal, setIsScanningLocal] = useState(false);

  // 30-Day Threat Frequency Telemetry State (RAM-Only Recharts dataset)
  const [thirtyDayTelemetry, setThirtyDayTelemetry] = useState<DailyThreatTelemetryPoint[]>(
    () => buildInitial30DayTelemetry()
  );
  const [chartViewMode, setChartViewMode] = useState<'timeline' | 'distribution'>('timeline');
  const [loggedScansCount, setLoggedScansCount] = useState<number>(1);

  // Increment Today's threat type counters based on a scan result
  const recordScanToTelemetry = useCallback((res: EmailScanResult) => {
    const hasPhishOrHomoglyph =
      Boolean(res.senderDetails?.hasHomoglyphs) ||
      res.redFlags.some((f) => /credential|password|typosquat|homoglyph|urgent/i.test(f));
    const hasBecOrSpoof =
      Boolean(res.senderDetails?.isSpoofed) ||
      res.redFlags.some((f) => /executive|wire|display name|spoof/i.test(f));
    const hasHeaderFail =
      res.senderDetails?.spfStatus === 'FAIL' ||
      res.senderDetails?.dmarcStatus === 'FAIL' ||
      Boolean(res.senderDetails?.replyToMismatch);
    const hasMaliciousLink = res.linkAssessments.some(
      (l) => l.verdict === 'MALICIOUS' || l.verdict === 'SUSPICIOUS'
    );

    if (!hasPhishOrHomoglyph && !hasBecOrSpoof && !hasHeaderFail && !hasMaliciousLink) {
      return;
    }

    setThirtyDayTelemetry((prev) => {
      const next = [...prev];
      const lastIdx = next.length - 1;
      if (lastIdx >= 0) {
        next[lastIdx] = {
          ...next[lastIdx],
          credentialPhishing:
            next[lastIdx].credentialPhishing + (hasPhishOrHomoglyph ? 1 : 0),
          becSpoofing: next[lastIdx].becSpoofing + (hasBecOrSpoof ? 1 : 0),
          headerAuthFail: next[lastIdx].headerAuthFail + (hasHeaderFail ? 1 : 0),
          maliciousLinks: next[lastIdx].maliciousLinks + (hasMaliciousLink ? 1 : 0),
        };
      }
      return next;
    });
    setLoggedScansCount((prev) => prev + 1);
  }, []);

  // Aggregate 30-day totals by threat type for distribution bar chart & KPI cards
  const threatCategoryTotals = useMemo(() => {
    const totals = thirtyDayTelemetry.reduce(
      (acc, pt) => {
        acc.credentialPhishing += pt.credentialPhishing;
        acc.becSpoofing += pt.becSpoofing;
        acc.headerAuthFail += pt.headerAuthFail;
        acc.maliciousLinks += pt.maliciousLinks;
        return acc;
      },
      { credentialPhishing: 0, becSpoofing: 0, headerAuthFail: 0, maliciousLinks: 0 }
    );

    return [
      {
        category: 'Credential Phish & Homoglyphs',
        shortName: 'Credential Phish',
        count: totals.credentialPhishing,
        color: '#EF4444',
      },
      {
        category: 'SPF / DMARC / Reply-To Fail',
        shortName: 'Header Auth Fail',
        count: totals.headerAuthFail,
        color: '#38BDF8',
      },
      {
        category: 'Malicious URLs & IP Links',
        shortName: 'Malicious Links',
        count: totals.maliciousLinks,
        color: '#2BB5A0',
      },
      {
        category: 'BEC & Display Name Spoofing',
        shortName: 'BEC / Wire Spoof',
        count: totals.becSpoofing,
        color: '#D79A45',
      },
    ];
  }, [thirtyDayTelemetry]);

  // Audible Alert System State (Web Audio API — 100% Client-Side RAM)
  const [audibleAlertsEnabled, setAudibleAlertsEnabled] = useState<boolean>(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [lastAudioAlertInfo, setLastAudioAlertInfo] = useState<{
    level: string;
    score: number;
    timestamp: string;
  } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const previousThreatSignatureRef = useRef<string>('');

  // Synthesize browser-native audible alert via Web Audio API
  const triggerAudibleThreatAlert = useCallback(
    (threatLevel: EmailScanResult['threatLevel'], riskScore: number, forcePlay = false) => {
      if (!audibleAlertsEnabled && !forcePlay) return;
      if (
        !forcePlay &&
        threatLevel !== 'CRITICAL_MALICIOUS' &&
        threatLevel !== 'HIGH_RISK'
      ) {
        return;
      }

      try {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const isCritical = threatLevel === 'CRITICAL_MALICIOUS' || riskScore >= 75;

        // Create master gain node
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.connect(ctx.destination);

        if (isCritical) {
          // Urgent 3-pulse tactical SOC klaxon chime (880Hz -> 660Hz -> 987Hz)
          const freqs = [880, 660, 987.77];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const pulseGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.14);

            pulseGain.gain.setValueAtTime(0.001, now + idx * 0.14);
            pulseGain.gain.exponentialRampToValueAtTime(0.22, now + idx * 0.14 + 0.02);
            pulseGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.12);

            osc.connect(pulseGain);
            pulseGain.connect(ctx.destination);

            osc.start(now + idx * 0.14);
            osc.stop(now + idx * 0.14 + 0.13);
          });
        } else {
          // High-Risk 2-pulse warning tone (740Hz -> 587Hz)
          const freqs = [739.99, 587.33];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const pulseGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.16);

            pulseGain.gain.setValueAtTime(0.001, now + idx * 0.16);
            pulseGain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.16 + 0.02);
            pulseGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.14);

            osc.connect(pulseGain);
            pulseGain.connect(ctx.destination);

            osc.start(now + idx * 0.16);
            osc.stop(now + idx * 0.16 + 0.15);
          });
        }

        setIsAudioPlaying(true);
        setLastAudioAlertInfo({
          level: threatLevel,
          score: riskScore,
          timestamp: new Date().toLocaleTimeString(),
        });
        setTimeout(() => setIsAudioPlaying(false), 650);
      } catch {
        // Ignore if browser autoplay policy blocks prior to interaction
      }
    },
    [audibleAlertsEnabled]
  );

  // Automatically scan using client-side heuristics on text change
  useEffect(() => {
    const result = scanEmailContent(bodyInput, senderInput, subjectInput, headersInput);
    setScanResult(result);

    // Trigger audible alert when a new high-risk / critical threat signature is detected
    const signature = `${result.threatLevel}-${result.riskScore}-${senderInput.slice(0, 20)}`;
    if (
      (result.threatLevel === 'CRITICAL_MALICIOUS' || result.threatLevel === 'HIGH_RISK') &&
      previousThreatSignatureRef.current !== signature
    ) {
      previousThreatSignatureRef.current = signature;
      const timer = setTimeout(() => {
        triggerAudibleThreatAlert(result.threatLevel, result.riskScore);
      }, 120);
      return () => clearTimeout(timer);
    }
    previousThreatSignatureRef.current = signature;
  }, [senderInput, subjectInput, headersInput, bodyInput, triggerAudibleThreatAlert]);

  // Load a sample and immediately evaluate audible alert if high-risk
  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const s = SAMPLE_EMAILS.find((x) => x.id === sampleId);
    if (s) {
      setSenderInput(s.sender);
      setSubjectInput(s.subject);
      setHeadersInput(s.headers);
      setBodyInput(s.body);
      const immediateResult = scanEmailContent(s.body, s.sender, s.subject, s.headers);
      recordScanToTelemetry(immediateResult);
      if (
        immediateResult.threatLevel === 'CRITICAL_MALICIOUS' ||
        immediateResult.threatLevel === 'HIGH_RISK'
      ) {
        triggerAudibleThreatAlert(immediateResult.threatLevel, immediateResult.riskScore);
      }
    }
  };

  // Perform 100% local deterministic deep triage in RAM (Zero-AI Mode)
  const handleRunLocalDeepTriage = () => {
    setIsScanningLocal(true);
    setTimeout(() => {
      const result = scanEmailContent(bodyInput, senderInput, subjectInput, headersInput);
      setScanResult(result);
      setIsScanningLocal(false);
      recordScanToTelemetry(result);
      if (result.threatLevel === 'CRITICAL_MALICIOUS' || result.threatLevel === 'HIGH_RISK') {
        triggerAudibleThreatAlert(result.threatLevel, result.riskScore, true);
      }
    }, 150);
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL_MALICIOUS':
        return {
          bg: 'bg-red-50 border-red-300 text-red-950',
          badge: 'bg-red-100 text-red-900 border-red-300',
          icon: <ShieldAlert className="w-6 h-6 text-red-700" />,
        };
      case 'HIGH_RISK':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-950',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <AlertTriangle className="w-6 h-6 text-amber-700" />,
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-yellow-50 border-yellow-300 text-yellow-950',
          badge: 'bg-yellow-100 text-yellow-900 border-yellow-300',
          icon: <AlertTriangle className="w-6 h-6 text-yellow-700" />,
        };
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-700" />,
        };
    }
  };

  const threatTheme = getThreatColor(scanResult?.threatLevel || 'CLEAN');

  return (
    <div className="space-y-6">
      {/* Postrix Command Header */}
      <section className="xh-panel">
        <div className="xh-kicker">
          <span className="k">Inbound Mail Header &amp; Payload Triage Engine · Zero-AI Mode</span>
          <span className="tag">SPF · DKIM · DMARC · 100% Local RAM</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-[#C9D3D9]/12">
          <div>
            <h2 className="text-lg font-semibold text-[#EEF3F1] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#5FD3BF]" />
              Automated Email Threat &amp; Malicious Link Filter
            </h2>
            <p className="text-xs text-[#A9B7BF] mt-0.5">
              Scans incoming mail headers, sender typosquatting, lookalike domains, and weaponized links 100% locally in browser RAM with real-time Web Audio high-risk alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Audible Alert System Toggle */}
            <button
              type="button"
              onClick={() => setAudibleAlertsEnabled((prev) => !prev)}
              aria-pressed={audibleAlertsEnabled}
              className={`xh-btn !py-2 !px-3 cursor-pointer ${
                audibleAlertsEnabled
                  ? '!border-[#5FD3BF]/60 !bg-[#2BB5A0]/15 !text-[#5FD3BF]'
                  : '!border-[#3E6E86]/40 !text-[#A9B7BF]'
              }`}
              title={
                audibleAlertsEnabled
                  ? 'Audible Threat Alerts Enabled (triggers audio notification on High-Risk / Critical threats)'
                  : 'Audible Threat Alerts Muted'
              }
            >
              {audibleAlertsEnabled ? (
                <Volume2 className={`w-4 h-4 ${isAudioPlaying ? 'animate-bounce text-[#EBC385]' : 'text-[#5FD3BF]'}`} />
              ) : (
                <VolumeX className="w-4 h-4 text-[#A9B7BF]" />
              )}
              <span>{audibleAlertsEnabled ? 'Audible Alert: ON' : 'Audible Alert: MUTE'}</span>
            </button>

            {/* Test Audio Notification Button */}
            <button
              type="button"
              onClick={() =>
                triggerAudibleThreatAlert(
                  scanResult?.threatLevel === 'HIGH_RISK' ? 'HIGH_RISK' : 'CRITICAL_MALICIOUS',
                  scanResult?.riskScore || 90,
                  true
                )
              }
              className="xh-btn !py-2 !px-3 cursor-pointer"
              title="Test browser Web Audio high-risk threat notification sound"
            >
              <BellRing className={`w-3.5 h-3.5 text-[#EBC385] ${isAudioPlaying ? 'animate-ping' : ''}`} />
              <span>Test Audio Chime</span>
            </button>

            <button
              type="button"
              onClick={handleRunLocalDeepTriage}
              disabled={isScanningLocal}
              className="xh-btn primary disabled:opacity-50 cursor-pointer"
            >
              {isScanningLocal ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Run Local Deep Triage</span>
            </button>
          </div>
        </div>

        {/* Preset Sample Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-4 text-xs">
          <span className="text-[#A9B7BF] font-mono text-[11px] uppercase mr-1 shrink-0">
            Load Preset:
          </span>
          {SAMPLE_EMAILS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectSample(s.id)}
              className={`xh-btn !py-1.5 !px-3 whitespace-nowrap shrink-0 ${
                selectedSampleId === s.id
                  ? '!border-[#5FD3BF] !bg-[#5FD3BF]/15 !text-[#5FD3BF]'
                  : ''
              }`}
            >
              {s.title.split('(')[0]}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid: Input Inspector on Left, Threat Verdict & Link Analysis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Input / Inspection Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#D9DDD3] rounded-xl p-5 space-y-3.5 text-xs shadow-xs">
            <div className="pb-3 border-b border-slate-200">
              <span className="rm-kicker">01 / Payload Input</span>
              <h3 className="text-sm font-semibold text-[#16232F] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0E2238]" /> Incoming Message Inspector
              </h3>
            </div>

            <div>
              <label className="block text-[#4B5A66] mb-1 font-medium">
                From (Sender Header):
              </label>
              <input
                type="text"
                value={senderInput}
                onChange={(e) => setSenderInput(e.target.value)}
                className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg px-3 py-2 text-[#16232F] outline-none focus:border-[#0E2238] font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[#4B5A66] mb-1 font-medium">Subject Line:</label>
              <input
                type="text"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg px-3 py-2 text-[#16232F] outline-none focus:border-[#0E2238] text-xs"
              />
            </div>

            <div>
              <label className="block text-[#4B5A66] mb-1 font-medium">Message Body:</label>
              <textarea
                value={bodyInput}
                onChange={(e) => setBodyInput(e.target.value)}
                rows={8}
                className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg p-3 text-[#16232F] outline-none focus:border-[#0E2238] text-xs font-sans leading-relaxed resize-none"
              />
            </div>

            {/* Collapsible Headers */}
            <details className="group pt-1">
              <summary className="cursor-pointer text-[11px] text-[#0E2238] hover:text-[#D79A45] transition font-mono font-semibold flex items-center gap-1 select-none">
                <span>[+] View Raw Transmission Headers (SPF / DKIM / Reply-To)</span>
              </summary>
              <div className="mt-2">
                <textarea
                  value={headersInput}
                  onChange={(e) => setHeadersInput(e.target.value)}
                  rows={4}
                  className="w-full bg-[#081420] border border-[#3E6E86]/50 rounded-lg p-2.5 text-[11px] text-[#5FD3BF] font-mono outline-none focus:border-[#5FD3BF] resize-none"
                />
              </div>
            </details>
          </div>
        </div>

        {/* Right Column: Automated Threat Alert & Link Inspection (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {scanResult && (
            <>
              {/* Verdict Banner */}
              <div
                className={`p-5 rounded-xl border transition-all shadow-xs ${threatTheme.bg}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-white/80 border border-black/10 shrink-0">
                      {threatTheme.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold tracking-tight">
                          {scanResult.threatLevel.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded uppercase border font-semibold tabular-nums ${threatTheme.badge}`}
                        >
                          Threat Score: {scanResult.riskScore} / 100
                        </span>
                        {(scanResult.threatLevel === 'CRITICAL_MALICIOUS' ||
                          scanResult.threatLevel === 'HIGH_RISK') && (
                          <button
                            type="button"
                            onClick={() =>
                              triggerAudibleThreatAlert(
                                scanResult.threatLevel,
                                scanResult.riskScore,
                                true
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded bg-[#0E2238] text-[#5FD3BF] border border-[#0E2238] font-semibold cursor-pointer hover:bg-[#16232F] transition"
                            title="Replay audible high-risk threat alert"
                          >
                            <BellRing
                              className={`w-3 h-3 text-[#EBC385] ${
                                isAudioPlaying ? 'animate-bounce' : ''
                              }`}
                            />
                            <span>
                              {audibleAlertsEnabled
                                ? `Audible Alert Active${
                                    lastAudioAlertInfo ? ` (${lastAudioAlertInfo.timestamp})` : ''
                                  }`
                                : 'Audible Alert Muted (Click to Play)'}
                            </span>
                          </button>
                        )}
                      </div>
                      <p className="text-xs mt-1 text-[#16232F] leading-relaxed">
                        {scanResult.techniqueAnalysis}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-4 pt-3 border-t border-black/10 flex items-center gap-3">
                  <span className="text-[11px] font-mono font-semibold">Risk Severity:</span>
                  <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        scanResult.riskScore >= 75
                          ? 'bg-red-600'
                          : scanResult.riskScore >= 45
                          ? 'bg-amber-600'
                          : scanResult.riskScore >= 20
                          ? 'bg-yellow-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${scanResult.riskScore}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold tabular-nums">
                    {scanResult.riskScore}%
                  </span>
                </div>
              </div>

              {/* Sender Authentication & Spoof Analysis */}
              <div className="bg-white border border-[#D9DDD3] rounded-xl p-5 text-xs space-y-3 shadow-xs">
                <div>
                  <span className="rm-kicker">02 / Header Verification</span>
                  <h3 className="font-semibold text-sm text-[#16232F] flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#0E2238]" /> Sender Authentication Analysis
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] font-mono">
                  <div className="p-2.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
                    <span className="text-[#4B5A66] block">Display Name Spoof:</span>
                    <span
                      className={`font-semibold ${
                        scanResult.senderDetails?.isSpoofed ? 'text-red-700' : 'text-emerald-700'
                      }`}
                    >
                      {scanResult.senderDetails?.isSpoofed ? 'DETECTED' : 'CLEAR'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
                    <span className="text-[#4B5A66] block">Homoglyph / Punycode:</span>
                    <span
                      className={`font-semibold ${
                        scanResult.senderDetails?.hasHomoglyphs ? 'text-red-700' : 'text-emerald-700'
                      }`}
                    >
                      {scanResult.senderDetails?.hasHomoglyphs ? 'FLAGGED' : 'CLEAR'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
                    <span className="text-[#4B5A66] block">Reply-To Routing:</span>
                    <span
                      className={`font-semibold ${
                        scanResult.senderDetails?.replyToMismatch
                          ? 'text-red-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {scanResult.senderDetails?.replyToMismatch ? 'MISMATCH' : 'MATCHED'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
                    <span className="text-[#4B5A66] block">Domain SPF / DMARC:</span>
                    <span
                      className={`font-semibold ${
                        scanResult.senderDetails?.spfStatus === 'PASS'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {scanResult.senderDetails?.spfStatus || 'UNVERIFIED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Red Flags Trigger List */}
              <div className="bg-white border border-[#D9DDD3] rounded-xl p-5 text-xs shadow-xs">
                <span className="rm-kicker">03 / Forensic Findings</span>
                <h3 className="font-semibold text-sm text-[#16232F] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#D79A45]" /> Telltale Threat Indicators
                </h3>
                <ul className="space-y-1.5">
                  {scanResult.redFlags.map((flag, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] flex items-start gap-2 text-[#16232F]"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-700 mt-0.5 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Embedded Links Inspection */}
              <div className="bg-white border border-[#D9DDD3] rounded-xl p-5 text-xs shadow-xs">
                <span className="rm-kicker">04 / URL Sandbox</span>
                <h3 className="font-semibold text-sm text-[#16232F] mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#0E2238]" /> Embedded Hyperlink Inspector (
                  {scanResult.linkAssessments.length})
                </h3>

                {scanResult.linkAssessments.length === 0 ? (
                  <p className="text-[#4B5A66] italic">No URLs found in email body.</p>
                ) : (
                  <div className="space-y-2">
                    {scanResult.linkAssessments.map((link, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[#0E2238] font-semibold break-all text-[11px]">
                            {link.url}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border shrink-0 font-semibold ${
                              link.verdict === 'MALICIOUS'
                                ? 'bg-red-100 text-red-900 border-red-300'
                                : link.verdict === 'SUSPICIOUS'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}
                          >
                            {link.verdict}
                          </span>
                        </div>
                        <p className="text-[#4B5A66] text-xs leading-relaxed">
                          {link.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actionable Recommendations */}
              <div className="p-4 rounded-xl bg-[#0D1C2D] border border-[#3E6E86]/50 text-xs text-[#EEF3F1]">
                <h4 className="font-semibold text-[#5FD3BF] font-mono mb-2 flex items-center gap-1.5 uppercase text-[11px]">
                  <ShieldCheck className="w-4 h-4" /> Recommended Defensive Action
                </h4>
                <ul className="space-y-1 text-[#C6D1D6]">
                  {scanResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5FD3BF]" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 30-Day Email Threat Type Frequency Visualization (Recharts) */}
      <section className="bg-white border border-[#D9DDD3] rounded-xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="rm-kicker">05 / 30-Day Threat Frequency Telemetry (Recharts)</span>
            <h3 className="text-base font-semibold text-[#16232F] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0E2238]" />
              Detected Email Threat Types Over the Last 30 Days
            </h3>
            <p className="text-xs text-[#4B5A66] mt-0.5">
              Visualizes rolling 30-day detection frequency across Credential Phishing, Header Auth Failures (SPF/DMARC), Malicious Links, and BEC Wire Spoofing. Live scans automatically update Today&apos;s telemetry in RAM ({loggedScansCount} active session scans logged).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setChartViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition cursor-pointer flex items-center gap-1.5 ${
                chartViewMode === 'timeline'
                  ? 'bg-[#0E2238] text-[#5FD3BF] border-[#0E2238] font-semibold'
                  : 'bg-[#F3F5F1] text-[#4B5A66] border-[#D9DDD3] hover:text-[#16232F]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>30-Day Timeline</span>
            </button>

            <button
              type="button"
              onClick={() => setChartViewMode('distribution')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition cursor-pointer flex items-center gap-1.5 ${
                chartViewMode === 'distribution'
                  ? 'bg-[#0E2238] text-[#5FD3BF] border-[#0E2238] font-semibold'
                  : 'bg-[#F3F5F1] text-[#4B5A66] border-[#D9DDD3] hover:text-[#16232F]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Threat Type Totals</span>
            </button>
          </div>
        </div>

        {/* 4 Threat Vector Frequency Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {threatCategoryTotals.map((item) => (
            <div
              key={item.category}
              className="p-3.5 rounded-xl bg-[#F3F5F1] border border-[#D9DDD3] flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-[11px] font-mono text-[#4B5A66] font-medium">
                  {item.category}
                </div>
                <div className="text-xl font-mono font-bold text-[#16232F] mt-0.5 tabular-nums">
                  {item.count}
                  <span className="text-[11px] font-normal text-[#4B5A66] ml-1.5">
                    detections (30d)
                  </span>
                </div>
              </div>
              <span
                className="w-3 h-10 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>

        {/* Recharts Visualization Canvas */}
        <div className="p-4 rounded-xl bg-[#081420] border border-[#3E6E86]/50">
          <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#A9B7BF]">
            <span>
              {chartViewMode === 'timeline'
                ? 'DAILY THREAT TYPE FREQUENCY (LAST 30 DAYS — STACKED TELEMETRY)'
                : 'CUMULATIVE 30-DAY DETECTIONS BY THREAT VECTOR'}
            </span>
            <span className="text-[#5FD3BF]">RAM-Only Telemetry · Zero External Tracking</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartViewMode === 'timeline' ? (
                <AreaChart
                  data={thirtyDayTelemetry}
                  margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradPhish" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gradHeader" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gradLinks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2BB5A0" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#2BB5A0" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gradBec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D79A45" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#D79A45" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A52" />
                  <XAxis
                    dataKey="dayLabel"
                    stroke="#A9B7BF"
                    tick={{ fill: '#A9B7BF', fontSize: 10 }}
                    interval={4}
                  />
                  <YAxis
                    stroke="#A9B7BF"
                    tick={{ fill: '#A9B7BF', fontSize: 10 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1C2D',
                      borderColor: '#3E6E86',
                      borderRadius: '0.5rem',
                      color: '#EEF3F1',
                      fontSize: '11px',
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: '11px',
                      fontFamily: 'IBM Plex Mono, monospace',
                      paddingTop: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="credentialPhishing"
                    name="Credential Phish"
                    stackId="1"
                    stroke="#EF4444"
                    fill="url(#gradPhish)"
                  />
                  <Area
                    type="monotone"
                    dataKey="headerAuthFail"
                    name="Header Auth Fail"
                    stackId="1"
                    stroke="#38BDF8"
                    fill="url(#gradHeader)"
                  />
                  <Area
                    type="monotone"
                    dataKey="maliciousLinks"
                    name="Malicious Links"
                    stackId="1"
                    stroke="#2BB5A0"
                    fill="url(#gradLinks)"
                  />
                  <Area
                    type="monotone"
                    dataKey="becSpoofing"
                    name="BEC / Wire Spoof"
                    stackId="1"
                    stroke="#D79A45"
                    fill="url(#gradBec)"
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={threatCategoryTotals}
                  margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A52" />
                  <XAxis
                    dataKey="shortName"
                    stroke="#A9B7BF"
                    tick={{ fill: '#EEF3F1', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#A9B7BF"
                    tick={{ fill: '#A9B7BF', fontSize: 10 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1C2D',
                      borderColor: '#3E6E86',
                      borderRadius: '0.5rem',
                      color: '#EEF3F1',
                      fontSize: '11px',
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}
                  />
                  <Bar dataKey="count" name="30-Day Detections" radius={[6, 6, 0, 0]}>
                    {threatCategoryTotals.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};
