import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Unlock,
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
  EyeOff,
  ServerOff,
} from 'lucide-react';

export type ActiveTab =
  | 'habits'
  | 'email_scanner'
  | 'phishing'
  | 'vulnerability_lab'
  | 'vishing'
  | 'breach_predictor'
  | 'training_game'
  | 'disclaimer';

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
    { id: 'habits', label: 'E2EE Habits', icon: <CalendarCheck className="w-3.5 h-3.5" /> },
    { id: 'email_scanner', label: 'Email Filter', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'phishing', label: 'Phishing Sim', icon: <Target className="w-3.5 h-3.5" /> },
    { id: 'vulnerability_lab', label: 'Vulnerability Lab', icon: <Bug className="w-3.5 h-3.5" /> },
    { id: 'vishing', label: 'Vishing Defense', icon: <PhoneCall className="w-3.5 h-3.5" /> },
    { id: 'breach_predictor', label: 'Breach Predictor', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
    { id: 'training_game', label: 'Threat Blitz', icon: <Gamepad2 className="w-3.5 h-3.5 text-[#EBC385]" /> },
  ];

  return (
    <>
      {/* Primary Postrix-Style Sticky Site Header */}
      <header className="rm-site-header px-4 sm:px-6 no-print">
        <div className="max-w-[1440px] mx-auto flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 min-h-[64px] py-2">
          {/* Brand Mark */}
          <a
            href="#habits"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('habits');
            }}
            className="rm-brand whitespace-nowrap shrink-0"
          >
            <span className="rm-mono-mark" aria-hidden="true">
              RM
            </span>
            <span>
              Maniq <span className="accent">Academy</span>
            </span>
          </a>

          {/* Main Navigation Tabs */}
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-4 xl:gap-6 overflow-x-auto no-scrollbar order-3 lg:order-2 w-full lg:w-auto pb-1 lg:pb-0"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={activeTab === item.id ? 'page' : undefined}
                className={`rm-navlink whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                  activeTab === item.id ? 'rm-navlink-active' : ''
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0 order-2 lg:order-3">
            <button
              type="button"
              onClick={() => onSelectTab('disclaimer')}
              className={`xh-btn whitespace-nowrap shrink-0 ${
                activeTab === 'disclaimer'
                  ? '!border-[#5FD3BF] !bg-[#5FD3BF]/15 !text-[#5FD3BF]'
                  : ''
              }`}
              title="Privacy Disclaimer: We do not store or record any information entered here"
            >
              <EyeOff className="w-3.5 h-3.5 text-[#5FD3BF]" />
              <span className="hidden sm:inline">Disclaimer</span>
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="xh-btn whitespace-nowrap shrink-0"
              title="Share with friends (no Google login needed)"
            >
              <Share2 className="w-3.5 h-3.5 text-[#EBC385]" />
              <span className="hidden md:inline">Share App</span>
            </button>

            <button
              type="button"
              onClick={onOpenPasswordGenerator}
              className="xh-btn whitespace-nowrap shrink-0"
              title="Open Cryptographic Password Generator"
            >
              <Key className="w-3.5 h-3.5 text-[#5FD3BF]" />
              <span className="hidden md:inline">Pass Gen</span>
            </button>

            <button
              type="button"
              onClick={onOpenVaultModal}
              className={`xh-btn whitespace-nowrap shrink-0 ${
                isLocked || !hasVault
                  ? '!border-[#D79A45]/60 !bg-[#D79A45]/15 !text-[#EBC385]'
                  : 'primary'
              }`}
            >
              {isLocked || !hasVault ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#EBC385]" />
                  <span>{hasVault ? 'Vault Locked' : 'Setup Vault'}</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>E2EE Vault Active</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Postrix-Style Telemetry & Governance Context Bar */}
      <div className="bg-[#0D1C2D] text-[#EEF3F1] border-b border-[#3E6E86]/35 px-4 sm:px-6 py-2.5 no-print">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-[#EEF3F1]">
              <Shield className="w-3.5 h-3.5 text-[#5FD3BF] shrink-0" />
              <span className="font-sans text-[#A9B7BF]">Encryption:</span>
              <strong className="font-semibold text-white">AES-GCM 256-bit</strong>
              <span className="text-[#5FD3BF] font-semibold">
                (RAM-Only · Zero-Knowledge)
              </span>
            </div>

            <span className="text-[#3E6E86] hidden sm:inline">·</span>

            <div className="flex items-center gap-1.5 text-[#C6D1D6]">
              <ServerOff className="w-3.5 h-3.5 text-[#EBC385] shrink-0" />
              <span className="text-[#A9B7BF]">Architecture:</span>
              <strong className="font-medium text-white">
                Zero-AI Mode · 0 Bytes Local &amp; Server Storage
              </strong>
            </div>

            <span className="text-[#3E6E86] hidden lg:inline">·</span>

            <div className="hidden lg:flex items-center gap-1.5 text-[#C6D1D6]">
              <span className="text-[#A9B7BF]">Author:</span>
              <a
                href="https://www.ravindran.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#5FD3BF] hover:text-[#EBC385] underline underline-offset-4 transition-colors"
              >
                Ravindran Mani (ravindran.in)
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] text-[#A9B7BF]">
              Mode:{' '}
              <strong className={isLocked ? 'text-[#EBC385]' : 'text-[#5FD3BF]'}>
                {isLocked ? 'RAM VAULT LOCKED' : 'VOLATILE RAM ACTIVE'}
              </strong>
            </span>
            <span className="text-[#3E6E86]">·</span>
            <button
              type="button"
              onClick={() => onSelectTab('disclaimer')}
              className="text-[#5FD3BF] hover:text-[#EBC385] font-mono text-[11px] underline underline-offset-4 cursor-pointer transition-colors"
            >
              Privacy &amp; Zero-Storage Disclaimer →
            </button>
          </div>
        </div>
      </div>

      {/* Share with Friends Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081420]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0D1C2D] border border-[#3E6E86]/60 rounded-xl p-6 text-[#EEF3F1] shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#C9D3D9]/15">
              <div className="flex items-center gap-3">
                <div className="rm-mono-mark" aria-hidden="true">
                  RM
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#EEF3F1] font-serif">
                    Share Maniq <span className="text-[#D79A45]">Academy</span>
                  </h3>
                  <p className="text-xs text-[#A9B7BF]">
                    Direct public access &mdash; no Google login required
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="xh-btn !py-1 !px-2.5 !text-xs"
              >
                Close
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-[#102236] border border-[#3E6E86]/40 space-y-2 mb-4 text-xs font-mono">
              <div className="flex items-center justify-between text-[#A9B7BF]">
                <span>Access Type:</span>
                <span className="text-[#5FD3BF] font-semibold">
                  Public (No Google Auth Required)
                </span>
              </div>
              <div className="flex items-center justify-between text-[#A9B7BF]">
                <span>Encryption:</span>
                <span className="text-[#EBC385] font-semibold">
                  100% Client-Side WebCrypto
                </span>
              </div>
              <div className="flex items-center justify-between text-[#A9B7BF]">
                <span>Author:</span>
                <span className="text-[#EEF3F1] font-semibold">Ravindran Mani</span>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-xs">
              <label className="text-[#C6D1D6] font-medium block">
                Public Shareable Link (Anyone with this link can access directly):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://ais-pre-elolfngen6z6f37daibx6g-647805725217.us-east1.run.app"
                  className="w-full bg-[#081420] border border-[#3E6E86]/50 rounded-lg px-3 py-2 text-xs font-mono text-[#5FD3BF] select-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      'https://ais-pre-elolfngen6z6f37daibx6g-647805725217.us-east1.run.app'
                    );
                    setCopiedShare(true);
                    setTimeout(() => setCopiedShare(false), 2500);
                  }}
                  className="xh-btn primary shrink-0"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
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
                <p className="text-[11px] text-[#5FD3BF] font-mono flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Link copied! Your friend can open this immediately without signing into Google.
                </p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-[#081420] border border-[#3E6E86]/40 text-xs text-[#C6D1D6] leading-relaxed mb-4">
              <strong className="text-[#EBC385]">Tip for sharing:</strong> Give them this public{' '}
              <code className="text-[#5FD3BF]">ais-pre-...</code> link. When they open it, they can immediately use all tools and choose either <em>Instant Demo Vault</em> or set their own private passphrase.
            </div>

            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="w-full xh-btn justify-center !py-2"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
