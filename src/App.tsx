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
import { VaultCredentialItem, EncryptedUserData, HabitItem } from './types';
import { Navbar, ActiveTab } from './components/Navbar';
import { HabitTracker } from './components/HabitTracker';
import { DailySecurityTip } from './components/DailySecurityTip';
import { SecurityTip } from './data/securityTipsData';
import { EmailScanner } from './components/EmailScanner';
import { PhishingCampaigns } from './components/PhishingCampaigns';
import { VulnerabilityLab } from './components/VulnerabilityLab';
import { SocialEngineeringTrainer } from './components/SocialEngineeringTrainer';
import { BreachPredictor } from './components/BreachPredictor';
import { CyberTrainingGame } from './components/CyberTrainingGame';
import { PrivacyDisclaimer } from './components/PrivacyDisclaimer';
import { VaultManagerModal } from './components/VaultManagerModal';
import { Lock, Key, EyeOff } from 'lucide-react';

const LEGACY_VAULT_STORAGE_KEY = 'cybershield_e2ee_vault';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('habits');

  // E2EE Vault State — Strictly Volatile Browser RAM Only (Zero localStorage Persistence)
  const [encryptedPayload, setEncryptedPayload] = useState<EncryptedPayload | null>(null);
  const [decryptedUserData, setDecryptedUserData] = useState<EncryptedUserData | null>(null);
  const [masterPassphrase, setMasterPassphrase] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [vaultModalTab, setVaultModalTab] = useState<'access' | 'generator' | 'credentials'>('access');

  // Inactivity auto-lock ref
  const lastActiveRef = useRef<number>(Date.now());

  // RAM-Only Mode initialization: purge any legacy localStorage keys and open vault setup in RAM
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_VAULT_STORAGE_KEY);
      localStorage.removeItem('cybershield_game_high_score');
      localStorage.removeItem('cybershield_game_highscore');
    } catch {
      // Ignore if storage access is restricted
    }
    setShowVaultModal(true);
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

  // Setup new vault in volatile RAM with user master passphrase
  const handleSetupVault = async (passphrase: string): Promise<boolean> => {
    try {
      const payload = await encryptVaultData(INITIAL_USER_DATA, passphrase);
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

  // Unlock existing in-RAM vault
  const handleUnlockVault = async (passphrase: string): Promise<boolean> => {
    if (!encryptedPayload) return false;
    try {
      const decrypted = await decryptVaultData<EncryptedUserData>(
        encryptedPayload,
        passphrase
      );
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

  // Lock vault immediately (wipes decrypted plaintext and passphrase from RAM)
  const handleLockVault = () => {
    setMasterPassphrase(null);
    setDecryptedUserData(null);
    setIsLocked(true);
  };

  // Wipe all volatile RAM session state and ensure localStorage is completely empty
  const handlePurgeLocalData = () => {
    try {
      localStorage.removeItem(LEGACY_VAULT_STORAGE_KEY);
      localStorage.removeItem('cybershield_game_high_score');
      localStorage.removeItem('cybershield_game_highscore');
    } catch {
      // Ignore
    }
    setEncryptedPayload(null);
    setDecryptedUserData(null);
    setMasterPassphrase(null);
    setIsLocked(true);
  };

  // Update user data and re-encrypt strictly in volatile RAM
  const handleUpdateUserData = async (updatedData: EncryptedUserData) => {
    setDecryptedUserData(updatedData);

    if (masterPassphrase) {
      try {
        const newPayload = await encryptVaultData(
          updatedData,
          masterPassphrase,
          encryptedPayload?.salt
        );
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

  // Convert a Daily Security Tip into a tracked E2EE Habit routine
  const handleAddTipAsHabit = async (tip: SecurityTip) => {
    if (!decryptedUserData) return;
    const categoryMap: Record<SecurityTip['category'], HabitItem['category']> = {
      'Identity & Access': 'identity',
      'Zero-Trust Network': 'network',
      'AppSec & Code': 'code_audit',
      'Phishing & OpSec': 'health_opsec',
      'Cloud Hardening': 'threat_intel',
      'Endpoint Defense': 'health_opsec',
    };
    const newHabit: HabitItem = {
      id: `h-tip-${Date.now()}`,
      title: tip.title,
      description: tip.actionableStep,
      category: categoryMap[tip.category] || 'identity',
      cadence: 'daily',
      priority: tip.impactLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      completedDates: [],
      streak: 0,
    };
    const updated: EncryptedUserData = {
      ...decryptedUserData,
      habits: [newHabit, ...decryptedUserData.habits],
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
    a.download = `maniq-academy-vault-${new Date().toISOString().split('T')[0]}.cybervault`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import encrypted backup into volatile RAM only
  const handleImportBackup = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content) as EncryptedPayload;
          if (parsed.ciphertext && parsed.iv && parsed.salt) {
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
    <div className="min-h-screen flex flex-col bg-[#F3F5F1] text-[#16232F]">
      {/* Top Postrix-Style Header & Subbar */}
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
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-8">
        {/* Habit & Productivity Tracker View */}
        {activeTab === 'habits' && (
          <div className="space-y-6">
            <DailySecurityTip
              isVaultUnlocked={!isLocked && !!decryptedUserData}
              onAddTipAsHabit={handleAddTipAsHabit}
            />

            {isLocked || !decryptedUserData ? (
              <section className="xh-panel max-w-2xl mx-auto text-center space-y-4 mt-6">
                <div className="xh-kicker justify-center">
                  <span className="k">Zero-Knowledge RAM-Only Cryptography · Zero-AI Mode</span>
                  <span className="tag">AES-GCM 256-Bit · 0 Bytes Stored</span>
                </div>
                <div className="pt-2 space-y-3">
                  <div className="w-14 h-14 rounded-xl bg-[#102236] border border-[#5FD3BF]/40 text-[#5FD3BF] mx-auto flex items-center justify-center shadow-md">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#EEF3F1]">
                      Zero-Knowledge RAM-Only Vault Locked
                    </h3>
                    <p className="text-xs text-[#A9B7BF] mt-1 max-w-md mx-auto leading-relaxed">
                      Operating in strict <strong>RAM-Only Mode</strong> and <strong>Zero-AI Mode</strong>. All habits, streaks, and credentials live exclusively in volatile browser memory using AES-GCM 256-bit — nothing is ever written to localStorage or any server.
                    </p>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setVaultModalTab('access');
                        setShowVaultModal(true);
                      }}
                      className="xh-btn primary mx-auto"
                    >
                      <Key className="w-4 h-4" />
                      <span>
                        {encryptedPayload
                          ? 'Unlock with Master Passphrase'
                          : 'Initialize Master Passphrase'}
                      </span>
                    </button>
                  </div>
                </div>
              </section>
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

        {/* Disclaimer & Zero-Storage Privacy Policy View */}
        {activeTab === 'disclaimer' && (
          <PrivacyDisclaimer
            hasLocalVault={!!encryptedPayload}
            onPurgeLocalData={handlePurgeLocalData}
          />
        )}
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

      {/* Postrix-Style Footer */}
      <footer className="bg-[#081420] text-[#B9C4CC] border-t border-[#3E6E86]/35 px-4 sm:px-6 py-6 mt-auto no-print">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rm-mono-mark !w-6 !h-6 !text-[11px]" aria-hidden="true">
              RM
            </span>
            <span>
              <strong className="font-serif text-sm font-semibold text-[#F3F5F1]">
                Maniq <span className="text-[#D79A45]">Academy</span>
              </strong>{' '}
              — Zero-Knowledge Cyber Defense &amp; Habit Suite · We Do Not Store or Record Entered Information
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('disclaimer')}
              className="font-mono text-[#5FD3BF] hover:text-[#EBC385] underline underline-offset-4 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Privacy Disclaimer</span>
            </button>
            <span className="text-[#3E6E86]">·</span>
            <span>
              Author: <strong className="font-medium text-[#F3F5F1]">Mani Ravindran</strong>
            </span>
            <span className="text-[#3E6E86]">·</span>
            <a
              href="https://www.ravindran.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[#5FD3BF] hover:text-[#EBC385] underline underline-offset-4 transition-colors"
            >
              ravindran.in
            </a>
            <span className="text-[#3E6E86]">·</span>
            <a
              href="https://ravindran.in/support.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-medium text-[#EBC385] hover:text-[#D79A45] underline underline-offset-4 transition-colors"
            >
              Support to Author
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
