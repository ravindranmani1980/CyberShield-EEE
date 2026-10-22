import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  CheckCircle2,
  Mail,
  Target,
  Bug,
  PhoneCall,
  BrainCircuit,
  CalendarCheck,
  Key,
  Share2,
  Copy,
  Check,
  Gamepad2,
} from 'lucide-react';

export type ActiveTab =
  | 'habits'
  | 'email_scanner'
  | 'phishing'
  | 'vulnerability_lab'
  | 'vishing'
  | 'breach_predictor'
  | 'training_game';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isLocked: boolean;
  hasVault: boolean;
  onOpenVaultModal: () => void;
  onOpenPasswordGenerator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  isLocked,
  hasVault,
  onOpenVaultModal,
  onOpenPasswordGenerator,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'habits', label: 'E2EE Habits & Focus', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'email_scanner', label: 'Email Threat Filter', icon: <Mail className="w-4 h-4" /> },
    { id: 'phishing', label: 'Phishing Campaigns', icon: <Target className="w-4 h-4" /> },
    { id: 'vulnerability_lab', label: 'Vulnerability Lab', icon: <Bug className="w-4 h-4" /> },
    { id: 'vishing', label: 'Vishing & OTP Defense', icon: <PhoneCall className="w-4 h-4" /> },
    { id: 'breach_predictor', label: 'ML Breach Predictor', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'training_game', label: 'Threat Blitz Game', icon: <Gamepad2 className="w-4 h-4 text-amber-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Author */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20">
            <Shield className="w-5 h-5 fill-slate-950 stroke-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                CyberShield <span className="text-emerald-400">E2EE</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                v2.6 SEC-OPS
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span>Zero-Knowledge AES-GCM 256</span>
              <span>&bull;</span>
              <span>Author:</span>
              <a
                href="https://www.ravindran.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-medium underline-offset-2 hover:underline"
              >
                Mani Ravindran (www.ravindran.in)
              </a>
            </div>
          </div>
        </div>

        {/* Action Controls: Share, Password Generator & Vault Status */}
        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-mono flex items-center gap-1.5 transition shadow-sm"
            title="Share with friends (no Google login needed)"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Share App</span>
          </button>

          <button
            onClick={onOpenPasswordGenerator}
            className="px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition shadow-sm"
            title="Open Cryptographic Password Generator"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Password Generator</span>
            <span className="sm:hidden">Pass Gen</span>
          </button>

          <button
            onClick={onOpenVaultModal}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition ${
              isLocked || !hasVault
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isLocked || !hasVault ? (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>{hasVault ? 'Vault Locked' : 'Setup Vault'}</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>E2EE Vault Active</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share with Friends Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Share CyberShield E2EE</h3>
                  <p className="text-xs text-slate-400">Direct public access &mdash; no Google login required</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 mb-4 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Access Type:</span>
                <span className="text-emerald-400 font-semibold">Public (No Google Auth Required)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Encryption:</span>
                <span className="text-cyan-400 font-semibold">100% Client-Side WebCrypto</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Author:</span>
                <span className="text-slate-200 font-semibold">Mani Ravindran</span>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-xs">
              <label className="text-slate-300 font-medium block">
                Public Shareable Link (Anyone with this link can access directly):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://ais-pre-elolfngen6z6f37daibx6g-647805725217.us-east1.run.app"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 select-all outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("https://ais-pre-elolfngen6z6f37daibx6g-647805725217.us-east1.run.app");
                    setCopiedShare(true);
                    setTimeout(() => setCopiedShare(false), 2500);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition shrink-0 shadow-md shadow-indigo-950"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
              {copiedShare && (
                <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Link copied! Your friend can open this immediately without signing into Google.
                </p>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 leading-relaxed mb-4">
              <strong>Tip for sharing:</strong> Give them this public <code>ais-pre-...</code> link. When they open it, they can immediately use all tools (Email Scanner, Phishing Simulator, Vulnerability Lab, Vishing Trainer, Password Generator) and choose either <em>Instant Demo Vault</em> or set their own private passphrase.
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Nav Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-3.5 py-2.5 font-medium whitespace-nowrap transition flex items-center gap-2 border-b-2 ${
              activeTab === item.id
                ? 'border-emerald-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
