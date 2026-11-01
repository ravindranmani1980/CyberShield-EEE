/**
 * Client-Side Zero-Knowledge End-to-End Encryption (E2EE) Module
 * Implements Web Crypto API:
 * - PBKDF2-SHA-256 Key Derivation (250,000 iterations, 128-bit salt)
 * - AES-GCM 256-bit authenticated encryption with 96-bit unique IV
 * - Zero plaintext stored in localStorage: strictly ciphertext, IV, and salt.
 */

export interface EncryptedPayload {
  ciphertext: string; // Base64
  iv: string; // Base64 (12 bytes)
  salt: string; // Base64 (16 bytes)
  version: number;
  timestamp: string;
}

// Convert ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derive AES-GCM 256-bit CryptoKey from user master passphrase + salt using PBKDF2
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as ArrayBuffer,
      iterations: 250000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt arbitrary JavaScript data (habits, productivity logs, reflections)
 */
export async function encryptVaultData<T>(
  data: T,
  passphrase: string,
  existingSaltBase64?: string
): Promise<EncryptedPayload> {
  const salt = existingSaltBase64
    ? base64ToBuffer(existingSaltBase64)
    : window.crypto.getRandomValues(new Uint8Array(16));

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  const jsonString = JSON.stringify(data);
  const encoded = new TextEncoder().encode(jsonString);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as ArrayBuffer,
    },
    key,
    encoded
  );

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    version: 1,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Decrypt ciphertext payload with user master passphrase
 * Will throw an error if the passphrase is incorrect (AES-GCM tag verification failure)
 */
export async function decryptVaultData<T>(
  payload: EncryptedPayload,
  passphrase: string
): Promise<T> {
  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);

  const key = await deriveKeyFromPassphrase(passphrase, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as ArrayBuffer,
      },
      key,
      ciphertext as unknown as ArrayBuffer
    );

    const decryptedJson = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decryptedJson) as T;
  } catch {
    throw new Error('Decryption failed: Incorrect master passphrase or tampered ciphertext.');
  }
}

/**
 * Helper to calculate passphrase entropy and strength rating
 */
export function evaluatePassphraseStrength(passphrase: string): {
  score: number; // 0 - 100
  label: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' | 'Quantum-Grade';
  color: string;
  feedback: string[];
} {
  const feedback: string[] = [];
  if (!passphrase) {
    return { score: 0, label: 'Very Weak', color: 'text-red-400', feedback: ['Enter a master passphrase'] };
  }

  let poolSize = 0;
  if (/[a-z]/.test(passphrase)) poolSize += 26;
  if (/[A-Z]/.test(passphrase)) poolSize += 26;
  if (/[0-9]/.test(passphrase)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(passphrase)) poolSize += 33;

  const entropyBits = Math.round(passphrase.length * Math.log2(poolSize || 1));
  let score = Math.min(100, Math.round((entropyBits / 80) * 100));

  if (passphrase.length < 10) {
    feedback.push('Use at least 12-16 characters for high resistance against brute-force');
    score = Math.min(score, 40);
  }
  if (!/[^a-zA-Z0-9]/.test(passphrase)) {
    feedback.push('Include symbols (e.g. !@#$%^&*) to expand search space');
  }
  if (!/[0-9]/.test(passphrase)) {
    feedback.push('Add numeric characters');
  }

  let label: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' | 'Quantum-Grade' = 'Weak';
  let color = 'text-red-400';

  if (score >= 85) {
    label = 'Quantum-Grade';
    color = 'text-emerald-400';
  } else if (score >= 65) {
    label = 'Strong';
    color = 'text-cyan-400';
  } else if (score >= 45) {
    label = 'Moderate';
    color = 'text-amber-400';
  }

  return { score, label, color, feedback };
}

export interface PasswordGenerationOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

/**
 * Generate a cryptographically secure random password using Web Crypto CSPRNG
 */
export function generateSecurePassword(options: PasswordGenerationOptions): {
  password: string;
  entropyBits: number;
  strengthLabel: 'Moderate' | 'Strong' | 'Quantum-Grade';
} {
  const uppercase = options.excludeAmbiguous
    ? 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = options.excludeAmbiguous
    ? 'abcdefghijkmnopqrstuvwxyz'
    : 'abcdefghijklmnopqrstuvwxyz';
  const numbers = options.excludeAmbiguous ? '23456789' : '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let charset = '';
  if (options.includeUppercase) charset += uppercase;
  if (options.includeLowercase) charset += lowercase;
  if (options.includeNumbers) charset += numbers;
  if (options.includeSymbols) charset += symbols;

  if (!charset) charset = lowercase + numbers;

  const length = Math.max(8, Math.min(64, options.length));
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  const arr: string[] = [];
  // Ensure at least one character from each enabled set is included
  if (options.includeUppercase && uppercase.length > 0) {
    arr.push(uppercase[randomValues[0] % uppercase.length]);
  }
  if (options.includeLowercase && lowercase.length > 0 && arr.length < length) {
    arr.push(lowercase[randomValues[1] % lowercase.length]);
  }
  if (options.includeNumbers && numbers.length > 0 && arr.length < length) {
    arr.push(numbers[randomValues[2] % numbers.length]);
  }
  if (options.includeSymbols && symbols.length > 0 && arr.length < length) {
    arr.push(symbols[randomValues[3] % symbols.length]);
  }

  // Fill remaining slots
  for (let i = arr.length; i < length; i++) {
    arr.push(charset[randomValues[i] % charset.length]);
  }

  // CSPRNG Fisher-Yates shuffle
  const shuffleValues = new Uint32Array(arr.length);
  window.crypto.getRandomValues(shuffleValues);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = shuffleValues[i] % (i + 1);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  const password = arr.join('');
  const entropyBits = Math.round(length * Math.log2(charset.length));

  let strengthLabel: 'Moderate' | 'Strong' | 'Quantum-Grade' = 'Strong';
  if (entropyBits >= 120) {
    strengthLabel = 'Quantum-Grade';
  } else if (entropyBits < 70) {
    strengthLabel = 'Moderate';
  }

  return { password, entropyBits, strengthLabel };
}

export interface PasswordComplexityAnalysis {
  complexityScore: number; // 0 - 100
  entropyBits: number;
  strengthLabel: 'Weak' | 'Moderate' | 'Strong' | 'Quantum-Grade';
  tierIndex: 0 | 1 | 2 | 3 | 4;
  crackTimeDisplay: string;
  charBreakdown: {
    upper: number;
    lower: number;
    digits: number;
    symbols: number;
    uniqueChars: number;
    uniqueRatio: number;
    activeClasses: number;
  };
  warnings: string[];
}

/**
 * Real-time deterministic password complexity & cryptographic strength analyzer
 */
export function evaluatePasswordComplexity(password: string): PasswordComplexityAnalysis {
  if (!password) {
    return {
      complexityScore: 0,
      entropyBits: 0,
      strengthLabel: 'Weak',
      tierIndex: 0,
      crackTimeDisplay: 'Instant (< 1 ms)',
      charBreakdown: {
        upper: 0,
        lower: 0,
        digits: 0,
        symbols: 0,
        uniqueChars: 0,
        uniqueRatio: 0,
        activeClasses: 0,
      },
      warnings: ['Enter or generate a password to evaluate complexity.'],
    };
  }

  const length = password.length;
  const upperMatches = password.match(/[A-Z]/g) || [];
  const lowerMatches = password.match(/[a-z]/g) || [];
  const digitMatches = password.match(/[0-9]/g) || [];
  const symbolMatches = password.match(/[^A-Za-z0-9]/g) || [];

  const upper = upperMatches.length;
  const lower = lowerMatches.length;
  const digits = digitMatches.length;
  const symbols = symbolMatches.length;

  let poolSize = 0;
  let activeClasses = 0;
  if (upper > 0) {
    poolSize += 26;
    activeClasses += 1;
  }
  if (lower > 0) {
    poolSize += 26;
    activeClasses += 1;
  }
  if (digits > 0) {
    poolSize += 10;
    activeClasses += 1;
  }
  if (symbols > 0) {
    poolSize += 32;
    activeClasses += 1;
  }

  const uniqueChars = new Set(password.split('')).size;
  const uniqueRatio = Math.round((uniqueChars / length) * 100);

  // Effective entropy accounting for character uniqueness
  const rawEntropy = poolSize > 0 ? length * Math.log2(poolSize) : 0;
  const uniquenessFactor = 0.65 + 0.35 * (uniqueChars / length);
  const entropyBits = Math.round(rawEntropy * uniquenessFactor);

  // Calculate 0-100 Complexity Score
  // 1. Length contribution (up to 45 pts)
  const lengthPts = Math.min(45, Math.round((length / 28) * 45));
  // 2. Character class diversity (up to 28 pts)
  const classPts = activeClasses * 7;
  // 3. Uniqueness & distribution balance (up to 17 pts)
  const uniquenessPts = Math.round((uniqueChars / length) * 17);
  // 4. Symbol & high-entropy bonus (up to 10 pts)
  const bonusPts = Math.min(10, symbols * 2 + (length >= 20 && activeClasses === 4 ? 4 : 0));

  const warnings: string[] = [];
  let penalty = 0;

  if (/(.)\1{2,}/.test(password)) {
    penalty += 12;
    warnings.push('Contains 3+ identical consecutive characters');
  }
  if (/(012|123|234|345|456|567|678|789|abc|bcd|cde|def|qwe|asd|zxc)/i.test(password)) {
    penalty += 15;
    warnings.push('Contains predictable sequential or keyboard pattern');
  }
  if (length < 12) {
    warnings.push('Length under 12 characters reduces brute-force margin');
  }
  if (activeClasses < 3) {
    warnings.push('Enable at least 3 character classes for stronger pool diversity');
  }

  const complexityScore = Math.max(4, Math.min(100, lengthPts + classPts + uniquenessPts + bonusPts - penalty));

  let strengthLabel: 'Weak' | 'Moderate' | 'Strong' | 'Quantum-Grade' = 'Weak';
  let tierIndex: 1 | 2 | 3 | 4 = 1;

  if (complexityScore >= 85 && entropyBits >= 110) {
    strengthLabel = 'Quantum-Grade';
    tierIndex = 4;
  } else if (complexityScore >= 68 && entropyBits >= 75) {
    strengthLabel = 'Strong';
    tierIndex = 3;
  } else if (complexityScore >= 45 && entropyBits >= 50) {
    strengthLabel = 'Moderate';
    tierIndex = 2;
  } else {
    strengthLabel = 'Weak';
    tierIndex = 1;
  }

  // Offline crack time estimation @ 10^11 guesses/sec (high-end GPU cluster)
  let crackTimeDisplay = '< 1 second';
  if (entropyBits >= 128) {
    crackTimeDisplay = '> 10²⁰ Years (Quantum-Safe)';
  } else if (entropyBits >= 100) {
    crackTimeDisplay = '~10¹² Years (Multi-Millennia)';
  } else if (entropyBits >= 80) {
    crackTimeDisplay = '~380,000 Years';
  } else if (entropyBits >= 65) {
    crackTimeDisplay = '~11 Years';
  } else if (entropyBits >= 52) {
    crackTimeDisplay = '~12 Hours';
  } else if (entropyBits >= 40) {
    crackTimeDisplay = '~11 Seconds';
  }

  return {
    complexityScore,
    entropyBits,
    strengthLabel,
    tierIndex,
    crackTimeDisplay,
    charBreakdown: {
      upper,
      lower,
      digits,
      symbols,
      uniqueChars,
      uniqueRatio,
      activeClasses,
    },
    warnings,
  };
}

