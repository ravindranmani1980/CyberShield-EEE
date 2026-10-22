/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  encryptVaultData,
  decryptVaultData,
  EncryptedPayload,
} from './lib/crypto';
import { INITIAL_USER_DATA } from './data/defaultVaultData';
import { VaultCredentialItem, EncryptedUserData } from './types';
import { Navbar, ActiveTab } from './components/Navbar';
import { HabitTracker } from './components/HabitTracker';
import { EmailScanner } from './components/EmailScanner';
import { PhishingCampaigns } from './components/PhishingCampaigns';
import { VulnerabilityLab } from './components/VulnerabilityLab';
import { SocialEngineeringTrainer } from './components/SocialEngineeringTrainer';
import { BreachPredictor } from './components/BreachPredictor';
import { CyberTrainingGame } from './components/CyberTrainingGame';
import { VaultManagerModal } from './components/VaultManagerModal';
import { Shield, Lock, ShieldAlert, Key, ExternalLink } from 'lucide-react';

const VAULT_STORAGE_KEY = 'cybershield_e2ee_vault';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('habits');

  // E2EE Vault State
  const [encryptedPayload, setEncryptedPayload] = useState<EncryptedPayload | null>(null);
  const [decryptedUserData, setDecryptedUserData] = useState<EncryptedUserData | null>(null);
  const [masterPassphrase, setMasterPassphrase] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [vaultModalTab, setVaultModalTab] = useState<'access' | 'generator' | 'credentials'>('access');

  // Inactivity auto-lock ref
  const lastActiveRef = useRef<number>(Date.now());

  // Load existing encrypted vault from localStorage on startup
  useEffect(() => {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (raw) {
      try {
        const payload = JSON.parse(raw) as EncryptedPayload;
        setEncryptedPayload(payload);
        setIsLocked(true);
        // Show unlock modal on startup if vault exists
        setShowVaultModal(true);
      } catch {
        console.warn('Corrupted vault storage, resetting.');
      }
    } else {
      // First time user: show modal to set up master passphrase
      setShowVaultModal(true);
    }
  }, []);

  // Inactivity auto-lock listener (15 minutes)
  useEffect(() => {
    const handleActivity = () => {
      lastActiveRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    const interval = setInterval(() => {
      if (!isLocked && Date.now() - lastActiveRef.current > 15 * 60 * 1000) {
        handleLockVault();
      }
    }, 30000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearInterval(interval);
    };
  }, [isLocked]);

  // Setup new vault with user master passphrase
  const handleSetupVault = async (passphrase: string): Promise<boolean> => {
    try {
      const payload = await encryptVaultData(INITIAL_USER_DATA, passphrase);
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(payload));
      setEncryptedPayload(payload);
      setDecryptedUserData(INITIAL_USER_DATA);
      setMasterPassphrase(passphrase);
      setIsLocked(false);
      setShowVaultModal(false);
      return true;
    } catch (err) {
      console.error('Failed to setup vault:', err);
      return false;
    }
  };

  // Unlock existing vault
  const handleUnlockVault = async (passphrase: string): Promise<boolean> => {
    if (!encryptedPayload) return false;
    try {
      const decrypted = await decryptVaultData<EncryptedUserData>(
        encryptedPayload,
        passphrase
      );
      // Ensure storedCredentials array exists
      if (!decrypted.storedCredentials) {
        decrypted.storedCredentials = INITIAL_USER_DATA.storedCredentials || [];
      }
      setDecryptedUserData(decrypted);
      setMasterPassphrase(passphrase);
      setIsLocked(false);
      setShowVaultModal(false);
      return true;
    } catch (err) {
      console.error('Failed to unlock vault:', err);
      return false;
    }
  };

  // Lock vault immediately
  const handleLockVault = () => {
    setMasterPassphrase(null);
    setDecryptedUserData(null);
    setIsLocked(true);
  };

  // Update user data and re-encrypt
  const handleUpdateUserData = async (updatedData: EncryptedUserData) => {
    setDecryptedUserData(updatedData);

    if (masterPassphrase) {
      try {
        const newPayload = await encryptVaultData(
          updatedData,
          masterPassphrase,
          encryptedPayload?.salt
        );
        localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(newPayload));
        setEncryptedPayload(newPayload);
      } catch (err) {
        console.error('Failed to re-encrypt vault data:', err);
      }
    }
  };

  // Save new account credential into encrypted vault
  const handleSaveCredential = async (cred: VaultCredentialItem) => {
    if (!decryptedUserData) return;
    const existing = decryptedUserData.storedCredentials || [];
    const updated = {
      ...decryptedUserData,
      storedCredentials: [cred, ...existing],
      lastUpdated: new Date().toISOString(),
    };
    await handleUpdateUserData(updated);
  };

  // Delete credential from encrypted vault
  const handleDeleteCredential = async (id: string) => {
    if (!decryptedUserData) return;
    const updated = {
      ...decryptedUserData,
      storedCredentials: (decryptedUserData.storedCredentials || []).filter((c) => c.id !== id),
      lastUpdated: new Date().toISOString(),
    };
    await handleUpdateUserData(updated);
  };

  // Export encrypted backup (.cybervault JSON)
  const handleExportBackup = () => {
    if (!encryptedPayload) return;
    const blob = new Blob([JSON.stringify(encryptedPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybershield-e2ee-vault-${new Date().toISOString().split('T')[0]}.cybervault`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import encrypted backup
  const handleImportBackup = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content) as EncryptedPayload;
          if (parsed.ciphertext && parsed.iv && parsed.salt) {
            localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(parsed));
            setEncryptedPayload(parsed);
            setIsLocked(true);
            setDecryptedUserData(null);
            setMasterPassphrase(null);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar HUD */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isLocked={isLocked}
        hasVault={!!encryptedPayload}
        onOpenVaultModal={() => {
          setVaultModalTab('access');
          setShowVaultModal(true);
        }}
        onOpenPasswordGenerator={() => {
          setVaultModalTab('generator');
          setShowVaultModal(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Habit & Productivity Tracker View */}
        {activeTab === 'habits' && (
          <div>
            {isLocked || !decryptedUserData ? (
              <div className="p-8 max-w-xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl mt-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Zero-Knowledge Personal Vault Locked
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    All habits, streaks, credentials, and threat hunting notes are encrypted using client-side AES-GCM 256-bit.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setVaultModalTab('access');
                    setShowVaultModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium text-xs shadow-lg shadow-emerald-950 transition flex items-center gap-2 mx-auto"
                >
                  <Key className="w-4 h-4" />
                  {encryptedPayload ? 'Unlock with Passphrase' : 'Create Master Passphrase'}
                </button>
              </div>
            ) : (
              <HabitTracker
                userData={decryptedUserData}
                onUpdateUserData={handleUpdateUserData}
                onOpenVaultModal={() => {
                  setVaultModalTab('access');
                  setShowVaultModal(true);
                }}
                isLocked={isLocked}
              />
            )}
          </div>
        )}

        {/* Email Scanner View */}
        {activeTab === 'email_scanner' && <EmailScanner />}

        {/* Phishing Campaign Simulator View */}
        {activeTab === 'phishing' && <PhishingCampaigns />}

        {/* Hands-on Vulnerability Lab View */}
        {activeTab === 'vulnerability_lab' && <VulnerabilityLab />}

        {/* Social Engineering & Vishing Trainer View */}
        {activeTab === 'vishing' && <SocialEngineeringTrainer />}

        {/* ML Breach Predictor View */}
        {activeTab === 'breach_predictor' && <BreachPredictor />}

        {/* Threat Blitz Training Game View */}
        {activeTab === 'training_game' && <CyberTrainingGame />}
      </main>

      {/* Vault Setup / Unlock / Password Generator Modal */}
      {showVaultModal && (
        <VaultManagerModal
          isLocked={isLocked}
          hasVault={!!encryptedPayload}
          onUnlock={handleUnlockVault}
          onSetup={handleSetupVault}
          onLock={handleLockVault}
          onExport={handleExportBackup}
          onImport={handleImportBackup}
          encryptedPayload={encryptedPayload}
          storedCredentials={decryptedUserData?.storedCredentials || []}
          onSaveCredential={handleSaveCredential}
          onDeleteCredential={handleDeleteCredential}
          defaultTab={vaultModalTab}
          onClose={() => {
            setShowVaultModal(false);
          }}
        />
      )}

      {/* Footer Info with Author & Website */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-slate-500 text-[11px] font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>CyberShield Defensive Platform &bull; Zero Plaintext Stored &bull; Client WebCrypto AES-GCM-256</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Author:</span>
            <span className="font-semibold text-slate-200">Mani Ravindran</span>
            <span>&bull;</span>
            <a
              href="https://www.ravindran.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline-offset-2 hover:underline flex items-center gap-1"
            >
              www.ravindran.in
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
