import React, { useState, useEffect } from 'react';
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
  const [isScanningAi, setIsScanningAi] = useState(false);

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
          <span className="k">Inbound Mail Header &amp; Payload Triage Engine</span>
          <span className="tag">SPF · DKIM · DMARC · Homoglyph Detection</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-[#C9D3D9]/12">
          <div>
            <h2 className="text-lg font-semibold text-[#EEF3F1] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#5FD3BF]" />
              Automated Email Threat &amp; Malicious Link Filter
            </h2>
            <p className="text-xs text-[#A9B7BF] mt-0.5">
              Scans incoming mail headers, sender typosquatting, lookalike domains, and weaponized links in real time without storing any data.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunAiTriage}
            disabled={isScanningAi}
            className="xh-btn primary disabled:opacity-50"
          >
            {isScanningAi ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Run Deep Threat Triage</span>
          </button>
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
    </div>
  );
};
