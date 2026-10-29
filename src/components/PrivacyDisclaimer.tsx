import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  ServerOff,
  FileWarning,
  Trash2,
  CheckCircle2,
  Database,
  Cpu,
  HardDrive,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

interface PrivacyDisclaimerProps {
  hasLocalVault: boolean;
  onPurgeLocalData?: () => void;
}

export const PrivacyDisclaimer: React.FC<PrivacyDisclaimerProps> = ({
  hasLocalVault,
  onPurgeLocalData,
}) => {
  const [confirmPurge, setConfirmPurge] = useState(false);
  const [purgedSuccess, setPurgedSuccess] = useState(false);

  const handlePurge = () => {
    if (onPurgeLocalData) {
      onPurgeLocalData();
    } else {
      localStorage.removeItem('cybershield_e2ee_vault');
    }
    setConfirmPurge(false);
    setPurgedSuccess(true);
    setTimeout(() => setPurgedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Postrix Command Panel Hero Disclaimer */}
      <section className="xh-panel">
        <div className="xh-kicker">
          <span className="k flex items-center gap-1.5">
            <ServerOff className="w-3.5 h-3.5 text-[#5FD3BF]" />
            Strict Zero-Retention · No Data Recording Policy
          </span>
          <span className="tag">0 Bytes Server Storage · 100% Auditable</span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-5">
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#EEF3F1] tracking-tight">
              Privacy &amp; Data Non-Storage Disclaimer
            </h1>

            <p className="text-xs sm:text-sm text-[#C6D1D6] leading-relaxed">
              <strong className="text-[#5FD3BF] font-semibold">
                We do not store, record, log, or retain any information that you enter on this platform.
              </strong>{' '}
              Maniq CyberShield E2EE is architected as a privacy-first, zero-knowledge cybersecurity training and personal defense suite. Every credential, passphrase, habit, email sample, or source code snippet you enter stays under your exclusive control.
            </p>
          </div>

          <div className="xh-metric text-center shrink-0 w-full md:w-56">
            <div className="w-10 h-10 rounded-lg bg-[#081420] border border-[#5FD3BF]/30 text-[#5FD3BF] flex items-center justify-center mx-auto mb-2">
              <EyeOff className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#A9B7BF]">
              Server Database Records
            </div>
            <div className="num hi mt-1">0 BYTES</div>
            <p>No Telemetry · No Tracking</p>
          </div>
        </div>
      </section>

      {/* Core Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#D9DDD3] rounded-xl p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0E2238] text-[#5FD3BF] flex items-center justify-center">
              <ServerOff className="w-4 h-4" />
            </div>
            <div>
              <span className="rm-kicker !mb-0">01 / Zero Backend Persistence</span>
              <h2 className="text-sm font-semibold text-[#16232F]">No Server-Side Recording</h2>
            </div>
          </div>
          <p className="text-xs text-[#4B5A66] leading-relaxed">
            We do not operate any backend database, analytics tracker, or keystroke logger. Information typed into any form, scanner, or simulator is never written to server disks or shared with third parties.
          </p>
        </div>

        <div className="bg-white border border-[#D9DDD3] rounded-xl p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0E2238] text-[#5FD3BF] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="rm-kicker !mb-0">02 / WebCrypto Standard</span>
              <h2 className="text-sm font-semibold text-[#16232F]">
                Zero-Knowledge Client Encryption
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#4B5A66] leading-relaxed">
            Your Master Passphrase never leaves your browser&apos;s volatile memory (RAM). Vault items are encrypted locally using the browser&apos;s native WebCrypto API (
            <code className="font-mono text-[#0E2238] font-semibold">AES-GCM 256-bit</code> &amp;{' '}
            <code className="font-mono text-[#0E2238] font-semibold">PBKDF2-SHA-256</code>).
          </p>
        </div>

        <div className="bg-white border border-[#D9DDD3] rounded-xl p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0E2238] text-[#EBC385] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="rm-kicker !mb-0">03 / Stateless Evaluation</span>
              <h2 className="text-sm font-semibold text-[#16232F]">
                Ephemeral In-Memory Processing
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#4B5A66] leading-relaxed">
            Email headers, code vulnerability scans, and breach posture inputs are evaluated transiently in memory to produce immediate feedback and are discarded the moment the evaluation completes.
          </p>
        </div>
      </div>

      {/* Module-by-Module Data Handling Breakdown */}
      <section className="bg-white border border-[#D9DDD3] rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-200">
          <div>
            <span className="rm-kicker">04 / Governance Verification Matrix</span>
            <h2 className="text-base font-semibold text-[#16232F] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Module-by-Module Data Handling Transparency
            </h2>
            <p className="text-xs text-[#4B5A66] mt-0.5">
              Exact technical verification of how each feature processes information you enter.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
            100% Auditable Privacy
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[#4B5A66] font-mono text-[11px] uppercase bg-[#F3F5F1]">
                <th className="py-3 px-3">Application Module</th>
                <th className="py-3 px-3">Information Entered</th>
                <th className="py-3 px-3">Where It Is Processed</th>
                <th className="py-3 px-3">Server Storage / Recording</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[#16232F]">
              <tr className="hover:bg-[#F3F5F1]/60">
                <td className="py-3 px-3 font-semibold">E2EE Habits &amp; Account Vault</td>
                <td className="py-3 px-3 text-[#4B5A66]">Passphrase, habits, generated credentials</td>
                <td className="py-3 px-3 font-mono text-[#0E2238] font-medium">
                  Browser WebCrypto API (Local)
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Never Stored on Server
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F3F5F1]/60">
                <td className="py-3 px-3 font-semibold">Email Threat Filter</td>
                <td className="py-3 px-3 text-[#4B5A66]">Email sender, subject, body text</td>
                <td className="py-3 px-3 font-mono text-[#0E2238] font-medium">
                  Ephemeral Heuristic / Stateless Scan
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Never Recorded or Logged
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F3F5F1]/60">
                <td className="py-3 px-3 font-semibold">Vulnerability Lab</td>
                <td className="py-3 px-3 text-[#4B5A66]">Source code snippets &amp; remediation patches</td>
                <td className="py-3 px-3 font-mono text-[#0E2238] font-medium">
                  Ephemeral AST / Pattern Evaluator
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Never Recorded or Logged
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F3F5F1]/60">
                <td className="py-3 px-3 font-semibold">Phishing &amp; Vishing Simulators</td>
                <td className="py-3 px-3 text-[#4B5A66]">Training responses &amp; drill choices</td>
                <td className="py-3 px-3 font-mono text-[#0E2238] font-medium">
                  In-Browser React State Only
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Never Recorded or Logged
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F3F5F1]/60">
                <td className="py-3 px-3 font-semibold">ML Breach Predictor &amp; Threat Blitz</td>
                <td className="py-3 px-3 text-[#4B5A66]">Telemetry sliders &amp; game scores</td>
                <td className="py-3 px-3 font-mono text-[#0E2238] font-medium">
                  Client-Side Calculation &amp; Local State
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Never Recorded or Logged
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Educational & Usage Disclaimer + Local Storage Purge Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legal & Educational Notice */}
        <div className="bg-white border border-[#D9DDD3] rounded-xl p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <FileWarning className="w-5 h-5 text-[#D79A45]" />
            <div>
              <span className="rm-kicker !mb-0">05 / Terms of Defensive Use</span>
              <h3 className="text-sm font-semibold text-[#16232F]">
                Educational &amp; Operational Disclaimer
              </h3>
            </div>
          </div>
          <div className="space-y-2.5 text-xs text-[#4B5A66] leading-relaxed">
            <p>
              <strong className="text-[#16232F]">1. No Data Liability or Custody:</strong> Because Maniq CyberShield E2EE never records, transmits, or stores your inputs on any backend server, we cannot recover lost master passphrases or view any data you enter.
            </p>
            <p>
              <strong className="text-[#16232F]">2. Authorized Defensive Training Only:</strong> All phishing templates, vishing scripts, and vulnerable code labs are provided strictly for defensive cybersecurity awareness, security engineering education, and authorized readiness drills.
            </p>
            <p>
              <strong className="text-[#16232F]">3. Local Browser Persistence:</strong> Only your encrypted vault ciphertext is cached inside your own web browser&apos;s{' '}
              <code className="font-mono text-[#0E2238] font-semibold">localStorage</code> so your habits persist across page reloads on your device. Clearing your browser data or using the purge button on this page permanently removes it.
            </p>
          </div>
        </div>

        {/* Interactive Local Browser Storage Inspector & Purge */}
        <div className="bg-white border border-[#D9DDD3] rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-5 h-5 text-[#0E2238]" />
                <div>
                  <span className="rm-kicker !mb-0">06 / Client Storage Sovereignty</span>
                  <h3 className="text-sm font-semibold text-[#16232F]">
                    Your Local Browser Storage Control
                  </h3>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded border font-semibold ${
                  hasLocalVault
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                {hasLocalVault ? 'Local Encrypted Vault Present' : 'Browser Storage Empty'}
              </span>
            </div>
            <p className="text-xs text-[#4B5A66] leading-relaxed">
              You have complete sovereignty over the encrypted state saved in your browser. At any time, you can wipe all locally cached browser data with a single click below.
            </p>
          </div>

          {purgedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>All local browser storage has been permanently wiped. Zero data remains.</span>
            </div>
          )}

          <div className="pt-2">
            {!confirmPurge ? (
              <button
                type="button"
                onClick={() => setConfirmPurge(true)}
                className="w-full py-2.5 px-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-700" />
                <span>Wipe All Local Browser Data Immediately</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-300 space-y-3">
                <div className="flex items-center gap-2 text-xs text-red-900">
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                  <span>
                    Confirm permanent deletion of your local browser&apos;s encrypted vault and scores?
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePurge}
                    className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Yes, Erase Local Browser Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmPurge(false)}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-[#16232F] border border-[#C7CDC0] text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Author & Contact Attribution */}
      <div className="p-4 rounded-xl bg-white border border-[#D9DDD3] flex flex-wrap items-center justify-between gap-3 text-xs text-[#4B5A66] font-mono shadow-xs">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#0E2238]" />
          <span>Maniq CyberShield E2EE · Privacy-By-Design Architecture</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Created by</span>
          <span className="text-[#16232F] font-semibold">Mani Ravindran</span>
          <span>·</span>
          <a
            href="https://www.ravindran.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0E2238] hover:text-[#D79A45] font-semibold underline underline-offset-4 flex items-center gap-1"
          >
            www.ravindran.in
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
