import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  Key,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Sliders,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  evaluatePassphraseStrength,
  generateSecurePassword,
  EncryptedPayload,
} from '../lib/crypto';
import { VaultCredentialItem } from '../types';

interface VaultManagerModalProps {
  isLocked: boolean;
  hasVault: boolean;
  onUnlock: (passphrase: string) => Promise<boolean>;
  onSetup: (passphrase: string) => Promise<boolean>;
  onLock: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<boolean>;
  encryptedPayload: EncryptedPayload | null;
  onClose?: () => void;
  storedCredentials?: VaultCredentialItem[];
  onSaveCredential?: (cred: VaultCredentialItem) => void;
  onDeleteCredential?: (id: string) => void;
  defaultTab?: 'access' | 'generator' | 'credentials';
}

export const VaultManagerModal: React.FC<VaultManagerModalProps> = ({
  isLocked,
  hasVault,
  onUnlock,
  onSetup,
  onLock,
  onExport,
  onImport,
  encryptedPayload,
  onClose,
  storedCredentials = [],
  onSaveCredential,
  onDeleteCredential,
  defaultTab = 'access',
}) => {
  const [activeTab, setActiveTab] = useState<'access' | 'generator' | 'credentials'>(
    !hasVault || isLocked ? 'access' : defaultTab
  );

  // Authentication State
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password Generator State
  const [genLength, setGenLength] = useState(24);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);

  const [generatedPassword, setGeneratedPassword] = useState('');
  const [entropyBits, setEntropyBits] = useState(156);
  const [strengthLabel, setStrengthLabel] = useState<string>('Quantum-Grade');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Save to vault form state
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [accountCategory, setAccountCategory] = useState<
    'cloud' | 'work' | 'personal' | 'infrastructure' | 'keys'
  >('cloud');
  const [accountNotes, setAccountNotes] = useState('');

  // Stored credentials view state
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [credentialFilter, setCredentialFilter] = useState('all');

  const strength = evaluatePassphraseStrength(passphrase);

  // Re-generate password using Web Crypto CSPRNG
  const handleRegenerate = () => {
    const res = generateSecurePassword({
      length: genLength,
      includeUppercase: includeUpper,
      includeLowercase: includeLower,
      includeNumbers: includeNumbers,
      includeSymbols: includeSymbols,
      excludeAmbiguous,
    });
    setGeneratedPassword(res.password);
    setEntropyBits(res.entropyBits);
    setStrengthLabel(res.strengthLabel);
  };

  // Generate on initial load
  useEffect(() => {
    handleRegenerate();
  }, [genLength, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous]);

  const handleCopyPassword = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Save generated password directly to encrypted vault
  const handleSaveToVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !onSaveCredential) return;

    const newCred: VaultCredentialItem = {
      id: `cred-${Date.now()}`,
      accountName: accountName.trim(),
      usernameOrEmail: usernameOrEmail.trim(),
      password: generatedPassword,
      category: accountCategory,
      notes: accountNotes.trim(),
      entropyBits,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveCredential(newCred);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }

    setAccountName('');
    setUsernameOrEmail('');
    setAccountNotes('');
    setShowSaveForm(false);
    setActiveTab('credentials');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!passphrase) {
      setError('Please enter your master passphrase.');
      return;
    }

    setLoading(true);
    try {
      if (!hasVault) {
        if (passphrase.length < 8) {
          setError('Master passphrase must be at least 8 characters.');
          setLoading(false);
          return;
        }
        if (passphrase !== confirmPassphrase) {
          setError('Passphrase confirmation does not match.');
          setLoading(false);
          return;
        }
        const ok = await onSetup(passphrase);
        if (ok) {
          setSuccessMsg('End-to-End Encrypted Vault created with PBKDF2 & AES-256-GCM.');
          setPassphrase('');
          setConfirmPassphrase('');
        } else {
          setError('Failed to initialize vault.');
        }
      } else {
        const ok = await onUnlock(passphrase);
        if (ok) {
          setSuccessMsg('Vault successfully decrypted.');
          setPassphrase('');
        } else {
          setError('Decryption failed: Incorrect master passphrase.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const ok = await onImport(file);
      if (ok) {
        setSuccessMsg('Encrypted vault backup successfully imported. Please unlock with its master passphrase.');
      } else {
        setError('Invalid backup file format.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to import backup.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCredentials = storedCredentials.filter((c) => {
    if (credentialFilter === 'all') return true;
    return c.category === credentialFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 text-slate-100 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Zero-Knowledge Vault Management
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  AES-256-GCM
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>By</span>
                <span className="font-semibold text-slate-200">Mani Ravindran</span>
                <span>&bull;</span>
                <a
                  href="https://www.ravindran.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition"
                >
                  www.ravindran.in
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
            >
              Close
            </button>
          )}
        </div>

        {/* Navigation Tabs inside Vault Manager */}
        <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('access')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition font-medium flex items-center justify-center gap-1.5 ${
              activeTab === 'access'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>Vault Status</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            disabled={isLocked && hasVault}
            className={`flex-1 py-1.5 px-3 rounded-lg transition font-medium flex items-center justify-center gap-1.5 disabled:opacity-40 ${
              activeTab === 'generator'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Password Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            disabled={isLocked && hasVault}
            className={`flex-1 py-1.5 px-3 rounded-lg transition font-medium flex items-center justify-center gap-1.5 disabled:opacity-40 ${
              activeTab === 'credentials'
                ? 'bg-slate-800 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stored Accounts ({storedCredentials.length})</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: VAULT ACCESS & ENCRYPTION STATUS */}
          {activeTab === 'access' && (
            <div className="space-y-4">
              {/* Architecture specs */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Symmetric Cipher:</span>
                  <span className="text-emerald-400 font-semibold">AES-GCM (256-bit Key, 96-bit IV)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Key Derivation:</span>
                  <span className="text-cyan-400 font-semibold">250,000 PBKDF2-SHA-256 Iterations</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Zero-Knowledge Guarantee:</span>
                  <span className="text-emerald-400 font-semibold">Client-Only (Zero Plaintext Stored)</span>
                </div>
                {encryptedPayload && (
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Ciphertext Size:</span>
                    <span className="text-slate-300 font-semibold">{encryptedPayload.ciphertext.length} bytes</span>
                  </div>
                )}
              </div>

              {isLocked || !hasVault ? (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      {!hasVault ? 'Create Master Passphrase' : 'Enter Master Passphrase'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="Master passphrase (never leaves browser unencrypted)..."
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 pr-10 outline-none transition"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {!hasVault && passphrase && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Entropy Strength:</span>
                          <span className={`font-semibold ${strength.color}`}>
                            {strength.label} ({strength.score}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              strength.score >= 80
                                ? 'bg-emerald-500'
                                : strength.score >= 50
                                ? 'bg-cyan-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${strength.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {!hasVault && (
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">
                        Confirm Master Passphrase
                      </label>
                      <input
                        type="password"
                        value={confirmPassphrase}
                        onChange={(e) => setConfirmPassphrase(e.target.value)}
                        placeholder="Confirm exact master passphrase..."
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium text-xs transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : isLocked && hasVault ? (
                      <>
                        <Unlock className="w-4 h-4" /> Decrypt & Access Vault
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" /> Initialize Encrypted Vault
                      </>
                    )}
                  </button>

                  {/* 1-Click Instant Demo Access */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={async () => {
                        setLoading(true);
                        setError(null);
                        const demoPass = 'CyberShieldDemo!2026';
                        try {
                          if (!hasVault) {
                            await onSetup(demoPass);
                          } else {
                            const ok = await onUnlock(demoPass);
                            if (!ok) {
                              // If they have an existing different passphrase, tell them or reset
                              setError('A custom vault already exists. Please enter your existing passphrase, or restore demo.');
                            }
                          }
                        } catch (err: any) {
                          setError(err?.message || 'Access error');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline-offset-2 hover:underline flex items-center justify-center gap-1.5 mx-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Quick Demo Access (1-Click Instant Explore)</span>
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1">
                      No Google login or signup needed &bull; Client-side AES-GCM encryption
                    </p>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Vault is active & decrypted in browser memory.</span>
                    </div>
                    <button
                      onClick={onLock}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition border border-slate-700 font-medium"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" /> Lock Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CRYPTOGRAPHIC PASSWORD GENERATOR */}
          {activeTab === 'generator' && (
            <div className="space-y-4 text-xs">
              {/* Generated Password Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    CSPRNG Generated Password:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {entropyBits} bits entropy &bull; {strengthLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedPassword}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-cyan-300 tracking-wider outline-none select-all"
                  />
                  <button
                    onClick={handleCopyPassword}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shrink-0"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRegenerate}
                    className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition shrink-0 shadow-md shadow-cyan-950"
                    title="Regenerate password"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {copiedNotification && (
                  <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Copied to clipboard!
                  </p>
                )}
              </div>

              {/* Generator Configuration Sliders & Toggles */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Password Length:</span>
                    <span className="font-mono text-cyan-400 font-bold">{genLength} chars</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="64"
                    value={genLength}
                    onChange={(e) => setGenLength(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeUpper}
                      onChange={(e) => setIncludeUpper(e.target.checked)}
                      className="accent-cyan-500"
                    />
                    <span className="text-slate-300 text-[11px]">Uppercase (A-Z)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeLower}
                      onChange={(e) => setIncludeLower(e.target.checked)}
                      className="accent-cyan-500"
                    />
                    <span className="text-slate-300 text-[11px]">Lowercase (a-z)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                      className="accent-cyan-500"
                    />
                    <span className="text-slate-300 text-[11px]">Numbers (0-9)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSymbols}
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                      className="accent-cyan-500"
                    />
                    <span className="text-slate-300 text-[11px]">Symbols (!@#$%)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer col-span-2">
                    <input
                      type="checkbox"
                      checked={excludeAmbiguous}
                      onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                      className="accent-cyan-500"
                    />
                    <span className="text-slate-300 text-[11px]">
                      Exclude Ambiguous (0, O, l, 1, I)
                    </span>
                  </label>
                </div>
              </div>

              {/* Save Directly to Encrypted Vault Action */}
              {!showSaveForm ? (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950"
                >
                  <Plus className="w-4 h-4" /> Save This Password To Encrypted Account Vault
                </button>
              ) : (
                <form
                  onSubmit={handleSaveToVault}
                  className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white flex items-center gap-1.5 font-mono">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      Save Account Credential into Encrypted Vault
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowSaveForm(false)}
                      className="text-slate-400 hover:text-white text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Account Name / Service:</label>
                      <input
                        type="text"
                        required
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="e.g. AWS Production Root"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Username / Email:</label>
                      <input
                        type="text"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        placeholder="e.g. sec-admin@domain.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Category:</label>
                      <select
                        value={accountCategory}
                        onChange={(e: any) => setAccountCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 outline-none focus:border-emerald-500 text-xs"
                      >
                        <option value="cloud">Cloud Infrastructure</option>
                        <option value="work">Corporate SSO / Work</option>
                        <option value="infrastructure">Servers & Network</option>
                        <option value="keys">API & SSH Keys</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Notes / Security Policy:</label>
                      <input
                        type="text"
                        value={accountNotes}
                        onChange={(e) => setAccountNotes(e.target.value)}
                        placeholder="e.g. YubiKey 5 NFC hardware backup"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition shadow-md shadow-emerald-950 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Commit to AES-256-GCM Encrypted Vault
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: STORED ACCOUNT CREDENTIALS */}
          {activeTab === 'credentials' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono text-[11px]">
                  Encrypted Accounts Stored: {storedCredentials.length}
                </span>

                <div className="flex items-center gap-1.5">
                  {['all', 'cloud', 'work', 'infrastructure', 'keys', 'personal'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCredentialFilter(cat)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize transition ${
                        credentialFilter === cat
                          ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredCredentials.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-slate-500">
                  <Key className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>No credentials stored in this category yet.</p>
                  <button
                    onClick={() => setActiveTab('generator')}
                    className="mt-2 text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Generate a new secure password &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCredentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-xs">{cred.accountName}</span>
                          {cred.usernameOrEmail && (
                            <span className="text-slate-400 font-mono text-[11px] block">
                              {cred.usernameOrEmail}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase bg-slate-900 text-slate-400 border border-slate-800">
                            {cred.category}
                          </span>
                          {onDeleteCredential && (
                            <button
                              onClick={() => onDeleteCredential(cred.id)}
                              className="text-slate-500 hover:text-rose-400 transition"
                              title="Delete credential"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Password Field with Reveal and Copy */}
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="font-mono text-cyan-300 flex-1 truncate text-xs">
                          {visiblePasswords[cred.id] ? cred.password : '••••••••••••••••••••••••'}
                        </span>

                        <button
                          onClick={() => togglePasswordVisibility(cred.id)}
                          className="text-slate-400 hover:text-white transition"
                          title={visiblePasswords[cred.id] ? 'Hide' : 'Reveal'}
                        >
                          {visiblePasswords[cred.id] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleCopyText(cred.password)}
                          className="text-slate-400 hover:text-cyan-300 transition"
                          title="Copy password"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {cred.notes && (
                        <p className="text-slate-400 text-[11px] italic">
                          Notes: {cred.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Backup Export/Import & Author Link */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onExport}
              disabled={!hasVault}
              className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition disabled:opacity-40"
              title="Download AES-encrypted .cybervault file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup</span>
            </button>

            <label className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore Backup</span>
              <input
                type="file"
                accept=".vault,.json,.cybervault"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <span>Author:</span>
            <a
              href="https://www.ravindran.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline font-semibold"
            >
              Mani Ravindran (www.ravindran.in)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
