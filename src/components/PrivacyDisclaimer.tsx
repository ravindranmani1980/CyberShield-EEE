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
      {/* Hero Disclaimer Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <ServerOff className="w-3.5 h-3.5 text-emerald-400" />
              <span>STRICT ZERO-RETENTION &bull; NO DATA RECORDING POLICY</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Privacy &amp; Data Non-Storage Disclaimer
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              <strong className="text-emerald-400 font-semibold">
                We do not store, record, log, or retain any information that you enter on this platform.
              </strong>{' '}
              Maniq CyberShield E2EE is architected as a privacy-first, zero-knowledge cybersecurity training and personal defense suite. Every credential, passphrase, habit, email sample, or source code snippet you enter stays under your exclusive control.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 text-center shrink-0 w-full md:w-56 space-y-1.5 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <EyeOff className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 pt-1">
              Server Database Records
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">0 BYTES</div>
            <div className="text-[11px] text-slate-400 font-mono">
              No Telemetry &bull; No Tracking
            </div>
          </div>
        </div>
      </div>

      {/* Core Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ServerOff className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">No Server-Side Recording</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            We do not operate any backend database, analytics tracker, or keystroke logger. Information typed into any form, scanner, or simulator is never written to server disks or shared with third parties.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Zero-Knowledge Client Encryption</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your Master Passphrase never leaves your browser&apos;s volatile memory (RAM). Vault items are encrypted locally using the browser&apos;s native WebCrypto API (<code className="text-cyan-300">AES-GCM 256-bit</code> &amp; <code className="text-cyan-300">PBKDF2-SHA-256</code>).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Ephemeral In-Memory Processing</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Email headers, code vulnerability scans, and breach posture inputs are evaluated transiently in memory to produce immediate feedback and are discarded the moment the evaluation completes.
          </p>
        </div>
      </div>

      {/* Module-by-Module Data Handling Breakdown */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Module-by-Module Data Handling Transparency
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Exact technical verification of how each feature processes information you enter.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-emerald-400">
            100% Auditable Privacy
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-3">Application Module</th>
                <th className="py-3 px-3">Information Entered</th>
                <th className="py-3 px-3">Where It Is Processed</th>
                <th className="py-3 px-3">Server Storage / Recording</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              <tr>
                <td className="py-3 px-3 font-semibold text-white">E2EE Habits &amp; Account Vault</td>
                <td className="py-3 px-3">Passphrase, habits, generated credentials</td>
                <td className="py-3 px-3 font-mono text-cyan-300">Browser WebCrypto API (Local)</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[11px]">
                    <CheckCircle2 className="w-3 h-3" /> Never Stored on Server
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Email Threat Filter</td>
                <td className="py-3 px-3">Email sender, subject, body text</td>
                <td className="py-3 px-3 font-mono text-cyan-300">Ephemeral Heuristic / Stateless Scan</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[11px]">
                    <CheckCircle2 className="w-3 h-3" /> Never Recorded or Logged
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Vulnerability Lab</td>
                <td className="py-3 px-3">Source code snippets &amp; remediation patches</td>
                <td className="py-3 px-3 font-mono text-cyan-300">Ephemeral AST / Pattern Evaluator</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[11px]">
                    <CheckCircle2 className="w-3 h-3" /> Never Recorded or Logged
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Phishing &amp; Vishing Simulators</td>
                <td className="py-3 px-3">Training responses &amp; drill choices</td>
                <td className="py-3 px-3 font-mono text-cyan-300">In-Browser React State Only</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[11px]">
                    <CheckCircle2 className="w-3 h-3" /> Never Recorded or Logged
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">ML Breach Predictor &amp; Threat Blitz</td>
                <td className="py-3 px-3">Telemetry sliders &amp; game scores</td>
                <td className="py-3 px-3 font-mono text-cyan-300">Client-Side Calculation &amp; Local State</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[11px]">
                    <CheckCircle2 className="w-3 h-3" /> Never Recorded or Logged
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational & Usage Disclaimer + Local Storage Purge Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legal & Educational Notice */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <FileWarning className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Educational &amp; Operational Disclaimer
            </h3>
          </div>
          <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <p>
              <strong>1. No Data Liability or Custody:</strong> Because Maniq CyberShield E2EE never records, transmits, or stores your inputs on any backend server, we cannot recover lost master passphrases or view any data you enter.
            </p>
            <p>
              <strong>2. Authorized Defensive Training Only:</strong> All phishing templates, vishing scripts, and vulnerable code labs are provided strictly for defensive cybersecurity awareness, security engineering education, and authorized readiness drills.
            </p>
            <p>
              <strong>3. Local Browser Persistence:</strong> Only your encrypted vault ciphertext is cached inside your own web browser&apos;s <code className="text-emerald-300">localStorage</code> so your habits persist across page reloads on your device. Clearing your browser data or using the purge button on this page permanently removes it.
            </p>
          </div>
        </div>

        {/* Interactive Local Browser Storage Inspector & Purge */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Your Local Browser Storage Control
                </h3>
              </div>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                  hasLocalVault
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {hasLocalVault ? 'Local Encrypted Vault Present' : 'Browser Storage Empty'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              You have complete sovereignty over the encrypted state saved in your browser. At any time, you can wipe all locally cached browser data with a single click below.
            </p>
          </div>

          {purgedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>All local browser storage has been permanently wiped. Zero data remains.</span>
            </div>
          )}

          <div className="pt-2">
            {!confirmPurge ? (
              <button
                onClick={() => setConfirmPurge(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Wipe All Local Browser Data Immediately</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3">
                <div className="flex items-center gap-2 text-xs text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    Confirm permanent deletion of your local browser&apos;s encrypted vault and scores?
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePurge}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
                  >
                    Yes, Erase Local Browser Data
                  </button>
                  <button
                    onClick={() => setConfirmPurge(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
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
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Maniq CyberShield E2EE &bull; Privacy-By-Design Architecture</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Created by</span>
          <span className="text-slate-200 font-semibold">Mani Ravindran</span>
          <span>&bull;</span>
          <a
            href="https://www.ravindran.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline flex items-center gap-1"
          >
            www.ravindran.in
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
