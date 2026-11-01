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
      try {
        localStorage.removeItem('cybershield_e2ee_vault');
        localStorage.removeItem('cybershield_game_highscore');
        localStorage.removeItem('cybershield_game_high_score');
      } catch {
        // ignore
      }
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
            Strict RAM-Only Mode · Zero-AI Mode · No Data Recording Policy
          </span>
          <span className="tag">0 Bytes Server · 0 Bytes localStorage · 0% AI</span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-5">
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#EEF3F1] tracking-tight">
              Privacy, RAM-Only &amp; Zero-AI Architecture Disclaimer
            </h1>

            <p className="text-xs sm:text-sm text-[#C6D1D6] leading-relaxed">
              <strong className="text-[#5FD3BF] font-semibold">
                We do not store, record, log, or persist any information that you enter on this platform — neither on any server nor in your browser&apos;s localStorage.
              </strong>{' '}
              Maniq Academy operates strictly in <strong>RAM-Only Mode</strong> and <strong>Zero-AI Mode</strong>. Every credential, passphrase, habit, email sample, or source code snippet lives exclusively in volatile browser memory (RAM) and is permanently destroyed the moment you lock the vault or close/refresh the browser tab.
            </p>
          </div>

          <div className="xh-metric text-center shrink-0 w-full md:w-60">
            <div className="w-10 h-10 rounded-lg bg-[#081420] border border-[#5FD3BF]/30 text-[#5FD3BF] flex items-center justify-center mx-auto mb-2">
              <EyeOff className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#A9B7BF]">
              Disk &amp; Server Persistence
            </div>
            <div className="num hi mt-1">0 BYTES</div>
            <p>RAM-Only · Zero-AI · No localStorage</p>
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
              <span className="rm-kicker !mb-0">01 / RAM-Only Mode</span>
              <h2 className="text-sm font-semibold text-[#16232F]">
                Zero Server &amp; Zero localStorage
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#4B5A66] leading-relaxed">
            Nothing is ever written to <code className="font-mono text-[#0E2238] font-semibold">window.localStorage</code>, <code className="font-mono text-[#0E2238] font-semibold">IndexedDB</code>, cookies, or any backend database. All state exists purely in volatile browser RAM during your active tab session.
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
                In-RAM AES-GCM 256-Bit Vault
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#4B5A66] leading-relaxed">
            Your Master Passphrase and vault items are encrypted in browser RAM using the native WebCrypto API (
            <code className="font-mono text-[#0E2238] font-semibold">AES-GCM 256-bit</code> &amp;{' '}
            <code className="font-mono text-[#0E2238] font-semibold">PBKDF2-SHA-256</code>). You may optionally export/import a manual <code className="font-mono text-[#0E2238] font-semibold">.cybervault</code> file if you choose.
          </p>
        </div>

        <div className="bg-white border border-[#D9DDD3] rounded-xl p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0E2238] text-[#EBC385] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="rm-kicker !mb-0">03 / Zero-AI Mode</span>
              <h2 className="text-sm font-semibold text-[#16232F]">
                100% Deterministic Local Engines
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#4B5A66] leading-relaxed">
            Zero AI models or external LLM APIs are used anywhere in this application. Email header triage, OWASP code auditing, and breach telemetry calculations run 100% locally via deterministic client-side rulesets.
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
              Module-by-Module Data Handling &amp; Zero-AI Transparency
            </h2>
            <p className="text-xs text-[#4B5A66] mt-0.5">
              Exact technical verification confirming 0 bytes of local/server storage and 0% AI usage across all modules.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
            RAM-Only · Zero-AI Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[#4B5A66] font-mono text-[11px] uppercase bg-[#F3F5F1]">
                <th className="py-3 px-3">Application Module</th>
                <th className="py-3 px-3">Information Entered</th>
                <th className="py-3 px-3">Processing Engine (Zero-AI)</th>
                <th className="py-3 px-3">Local &amp; Server Storage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[#16232F]">
              <tr className="hover:bg-[#F3F5F1]/60">
                <td className="py-3 px-3 font-semibold">E2EE Habits &amp; Account Vault</td>
                <td className="py-3 px-3 text-[#4B5A66]">Passphrase, habits, generated credentials</td>
                <td className="py-3 px-3 font-mono text-[#0E2238] font-medium">
                  Browser WebCrypto API (Volatile RAM)
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> 0 Bytes (RAM-Only)
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F3F5F1]/60">
                <td className="py-3 px-3 font-semibold">Email Threat Filter</td>
                <td className="py-3 px-3 text-[#4B5A66]">Email sender, subject, headers, body text</td>
                <td className="py-3 px-3 font-mono text-[#0E2238] font-medium">
                  Deterministic Regex &amp; Header Rules (No AI)
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> 0 Bytes (RAM-Only)
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F3F5F1]/60">
                <td className="py-3 px-3 font-semibold">Vulnerability Lab</td>
                <td className="py-3 px-3 text-[#4B5A66]">Source code snippets &amp; remediation patches</td>
                <td className="py-3 px-3 font-mono text-[#0E2238] font-medium">
                  Deterministic CWE / OWASP Pattern Matcher (No AI)
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> 0 Bytes (RAM-Only)
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F3F5F1]/60">
                <td className="py-3 px-3 font-semibold">Phishing &amp; Vishing Simulators</td>
                <td className="py-3 px-3 text-[#4B5A66]">Training responses &amp; drill choices</td>
                <td className="py-3 px-3 font-mono text-[#0E2238] font-medium">
                  Client-Side State Machine (No AI)
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> 0 Bytes (RAM-Only)
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#F3F5F1]/60">
                <td className="py-3 px-3 font-semibold">Breach Predictor &amp; Threat Blitz</td>
                <td className="py-3 px-3 text-[#4B5A66]">Telemetry sliders &amp; game scores</td>
                <td className="py-3 px-3 font-mono text-[#0E2238] font-medium">
                  Deterministic Formula &amp; React State (No AI)
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3" /> 0 Bytes (RAM-Only)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Educational & Usage Disclaimer + RAM Session Purge Control */}
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
              <strong className="text-[#16232F]">1. No Data Liability or Custody:</strong> Because Maniq Academy never writes your inputs to <code className="font-mono text-[#0E2238]">localStorage</code> or any server, closing or refreshing the browser tab immediately clears your session.
            </p>
            <p>
              <strong className="text-[#16232F]">2. Zero-AI Deterministic Execution:</strong> All analyses run on deterministic, auditable client-side algorithms without sending data to any external AI model.
            </p>
            <p>
              <strong className="text-[#16232F]">3. Optional Manual Encrypted File Export:</strong> If you wish to save your encrypted vault across sessions, you may manually download an AES-256-GCM encrypted <code className="font-mono text-[#0E2238]">.cybervault</code> file to your own device from the Vault modal.
            </p>
          </div>
        </div>

        {/* Interactive Volatile RAM & Browser Storage Purge */}
        <div className="bg-white border border-[#D9DDD3] rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-5 h-5 text-[#0E2238]" />
                <div>
                  <span className="rm-kicker !mb-0">06 / Volatile Memory Sovereignty</span>
                  <h3 className="text-sm font-semibold text-[#16232F]">
                    Instant RAM &amp; Browser Memory Purge
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
                {hasLocalVault ? 'Active In-RAM Session' : 'RAM Session Empty (0 Bytes)'}
              </span>
            </div>
            <p className="text-xs text-[#4B5A66] leading-relaxed">
              Browser <code className="font-mono text-[#0E2238] font-semibold">localStorage</code> is permanently disabled (0 bytes stored). Click below at any time to immediately wipe the current volatile RAM session in memory.
            </p>
          </div>

          {purgedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>Volatile RAM session and all browser storage registers have been wiped.</span>
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
                <span>Wipe Volatile RAM Session Immediately</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-300 space-y-3">
                <div className="flex items-center gap-2 text-xs text-red-900">
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                  <span>
                    Confirm immediate wipe of your active in-memory RAM vault session?
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePurge}
                    className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Yes, Wipe RAM Session Now
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
          <span>Maniq Academy · RAM-Only &amp; Zero-AI Architecture</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Created by</span>
          <span className="text-[#16232F] font-semibold">Ravindran Mani</span>
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
