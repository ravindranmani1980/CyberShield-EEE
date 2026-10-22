import React, { useState, useEffect } from 'react';
import {
  Mail,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Link as LinkIcon,
  Search,
  ExternalLink,
  Info,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';
import { scanEmailContent } from '../lib/emailAnalyzer';
import { EmailScanResult } from '../types';

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

DocuSign Inc. &bull; 221 Main St, San Francisco, CA`,
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
  const [isScanningAi, setIsScanningAi] = useState(false);
  const [inspectedLinkModal, setInspectedLinkModal] = useState<string | null>(null);

  // Automatically scan using client-side heuristics on text change
  useEffect(() => {
    const result = scanEmailContent(bodyInput, senderInput, subjectInput, headersInput);
    setScanResult(result);
  }, [senderInput, subjectInput, headersInput, bodyInput]);

  // Load a sample
  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const s = SAMPLE_EMAILS.find((x) => x.id === sampleId);
    if (s) {
      setSenderInput(s.sender);
      setSubjectInput(s.subject);
      setHeadersInput(s.headers);
      setBodyInput(s.body);
    }
  };

  // Perform AI-augmented deep triage via server endpoint
  const handleRunAiTriage = async () => {
    setIsScanningAi(true);
    try {
      const extractedUrls = scanEmailContent(bodyInput, senderInput, subjectInput, headersInput)
        .linkAssessments.map((l) => l.url);

      const resp = await fetch('/api/analyze-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: senderInput,
          subject: subjectInput,
          emailText: bodyInput,
          headers: headersInput,
          links: extractedUrls,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.threatLevel) {
          setScanResult((prev) => ({
            ...prev!,
            threatLevel: data.threatLevel,
            riskScore: data.riskScore ?? prev!.riskScore,
            redFlags: data.redFlags ?? prev!.redFlags,
            linkAssessments: data.linkAssessments ?? prev!.linkAssessments,
            techniqueAnalysis: data.techniqueAnalysis ?? prev!.techniqueAnalysis,
            recommendations: data.recommendations ?? prev!.recommendations,
          }));
        }
      }
    } catch (err) {
      console.warn('AI Triage error, using client heuristics:', err);
    } finally {
      setIsScanningAi(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL_MALICIOUS':
        return {
          bg: 'bg-rose-950/70 border-rose-500/50 text-rose-200',
          badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          icon: <ShieldAlert className="w-6 h-6 text-rose-400" />,
        };
      case 'HIGH_RISK':
        return {
          bg: 'bg-amber-950/70 border-amber-500/50 text-amber-200',
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-yellow-950/70 border-yellow-500/50 text-yellow-200',
          badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
          icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
        };
      default:
        return {
          bg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200',
          badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
        };
    }
  };

  const threatTheme = getThreatColor(scanResult?.threatLevel || 'CLEAN');

  return (
    <div className="space-y-6">
      {/* Header and Sample Chooser */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              Automated Email Threat & Malicious Link Filter
            </h2>
            <p className="text-xs text-slate-400">
              Scans incoming mail headers, sender typosquatting, lookalike domains, and weaponized links in real time.
            </p>
          </div>

          <button
            onClick={handleRunAiTriage}
            disabled={isScanningAi}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-cyan-950 disabled:opacity-50"
          >
            {isScanningAi ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-200" />
            )}
            Run Deep AI Threat Triage
          </button>
        </div>

        {/* Preset Sample Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-mono text-[11px] uppercase mr-1">Load Preset:</span>
          {SAMPLE_EMAILS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectSample(s.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition border text-xs font-medium ${
                selectedSampleId === s.id
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {s.title.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Inspector on Left, Threat Verdict & Link Analysis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Input / Inspection Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Incoming Message Inspector
            </h3>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">From (Sender Header):</label>
              <input
                type="text"
                value={senderInput}
                onChange={(e) => setSenderInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Subject Line:</label>
              <input
                type="text"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Message Body:</label>
              <textarea
                value={bodyInput}
                onChange={(e) => setBodyInput(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:border-cyan-500 text-xs font-sans leading-relaxed resize-none"
              />
            </div>

            {/* Collapsible Headers */}
            <details className="group">
              <summary className="cursor-pointer text-[11px] text-slate-400 hover:text-cyan-400 transition font-mono flex items-center gap-1 select-none">
                <span>[+] View Raw Transmission Headers (SPF / DKIM / Reply-To)</span>
              </summary>
              <div className="mt-2">
                <textarea
                  value={headersInput}
                  onChange={(e) => setHeadersInput(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950/90 border border-slate-800/80 rounded-xl p-2.5 text-[11px] text-slate-400 font-mono outline-none focus:border-cyan-500 resize-none"
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
                className={`p-5 rounded-2xl border shadow-xl transition-all ${threatTheme.bg}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-black/30 shrink-0">
                      {threatTheme.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold tracking-tight">
                          {scanResult.threatLevel.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase border font-semibold ${threatTheme.badge}`}
                        >
                          Threat Score: {scanResult.riskScore} / 100
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-slate-300 leading-relaxed">
                        {scanResult.techniqueAnalysis}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-300">Risk Severity:</span>
                  <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        scanResult.riskScore >= 75
                          ? 'bg-rose-500'
                          : scanResult.riskScore >= 45
                          ? 'bg-amber-500'
                          : scanResult.riskScore >= 20
                          ? 'bg-yellow-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${scanResult.riskScore}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold">
                    {scanResult.riskScore}%
                  </span>
                </div>
              </div>

              {/* Sender Authentication & Spoof Analysis */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-3">
                <h3 className="font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" /> Sender Authentication Analysis
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block">Display Name Spoof:</span>
                    <span
                      className={`font-semibold ${
                        scanResult.senderDetails?.isSpoofed ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {scanResult.senderDetails?.isSpoofed ? 'DETECTED' : 'CLEAR'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block">Homoglyph / Punycode:</span>
                    <span
                      className={`font-semibold ${
                        scanResult.senderDetails?.hasHomoglyphs ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {scanResult.senderDetails?.hasHomoglyphs ? 'FLAGGED' : 'CLEAR'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block">Reply-To Routing:</span>
                    <span
                      className={`font-semibold ${
                        scanResult.senderDetails?.replyToMismatch
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {scanResult.senderDetails?.replyToMismatch ? 'MISMATCH' : 'MATCHED'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block">Domain SPF / DMARC:</span>
                    <span
                      className={`font-semibold ${
                        scanResult.senderDetails?.spfStatus === 'PASS'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {scanResult.senderDetails?.spfStatus || 'UNVERIFIED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Red Flags Trigger List */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Telltale Threat Indicators
                </h3>
                <ul className="space-y-1.5">
                  {scanResult.redFlags.map((flag, idx) => (
                    <li
                      key={idx}
                      className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2 text-slate-300"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Embedded Links Inspection */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-cyan-400" /> Embedded Hyperlink Inspector (
                  {scanResult.linkAssessments.length})
                </h3>

                {scanResult.linkAssessments.length === 0 ? (
                  <p className="text-slate-500 italic">No URLs found in email body.</p>
                ) : (
                  <div className="space-y-2">
                    {scanResult.linkAssessments.map((link, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-cyan-300 font-semibold break-all text-[11px]">
                            {link.url}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase border shrink-0 ${
                              link.verdict === 'MALICIOUS'
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold'
                                : link.verdict === 'SUSPICIOUS'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            }`}
                          >
                            {link.verdict}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          {link.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actionable Recommendations */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs">
                <h4 className="font-bold text-indigo-300 font-mono mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Recommended Defensive Action
                </h4>
                <ul className="space-y-1 text-slate-300">
                  {scanResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
