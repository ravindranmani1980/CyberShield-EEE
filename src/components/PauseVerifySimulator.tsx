import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  PhoneIncoming,
  PhoneOff,
  Timer,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Brain,
  Lock,
  Sparkles,
  Activity,
  XCircle,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface SuspiciousCallScenario {
  id: string;
  callerDisplay: string;
  spoofedNumber: string;
  claimedRole: string;
  pressureTactic: 'Artificial Urgency' | 'Executive Authority' | 'Fear & Panic' | 'Technical Crisis';
  panicQuote: string;
  demandedAction: string;
  redFlags: string[];
  verificationChannel: string;
  debriefTakeaway: string;
}

const SUSPICIOUS_CALL_POOL: SuspiciousCallScenario[] = [
  {
    id: 'call-1',
    callerDisplay: 'Corporate Security SOC (Tier-3)',
    spoofedNumber: '+1 (800) 555-0199 [Internal Spoof]',
    claimedRole: 'Senior Identity & Okta Incident Responder',
    pressureTactic: 'Fear & Panic',
    panicQuote:
      '"We are seeing an active credential-stuffing session from an unauthorized foreign IP on your SSO account right now! If you don\'t read me the 6-digit verification code I just triggered to your phone within 30 seconds, your workstation and payroll access will be locked for 14 days!"',
    demandedAction: 'Read aloud the 6-digit SMS/Authenticator MFA code',
    redFlags: [
      'Inbound caller demanding an MFA/OTP code',
      'Threatening immediate 14-day account lockout to induce panic',
      'Spoofed internal toll-free caller ID',
    ],
    verificationChannel:
      'Hang up immediately. Open your official internal IT Slack channel or ticketing portal independently to verify if any SOC incident exists.',
    debriefTakeaway:
      'Real SOC engineers can revoke sessions directly from the admin console—they NEVER need you to read an MFA code over the phone.',
  },
  {
    id: 'call-2',
    callerDisplay: 'Office of the CFO (Voice Clone)',
    spoofedNumber: '+1 (415) 890-4410 [Executive Mobile]',
    claimedRole: 'Chief Financial Officer',
    pressureTactic: 'Executive Authority',
    panicQuote:
      '"I\'m stepping onto a flight to Zurich and our acquisition escrow closes in 10 minutes. I need you to bypass the standard dual-approval queue and release the $48,500 bridge wire to this new liquidity routing number immediately—do NOT delay this or the deal collapses!"',
    demandedAction: 'Bypass dual-control wire verification for an urgent $48,500 transfer',
    redFlags: [
      'Demand to bypass established multi-party financial controls',
      'Convenient inability to be reached ("stepping onto a flight")',
      'High-stakes AI voice clone / executive authority pressure',
    ],
    verificationChannel:
      'Pause, refuse in-call wire changes, and initiate an out-of-band video call or contact the Finance Controller via known internal directory numbers.',
    debriefTakeaway:
      'Synthetic voice clones mimic tone and cadence. A strict Pause & Verify habit via an independent channel neutralizes deepfake executive urgency.',
  },
  {
    id: 'call-3',
    callerDisplay: 'Global Bank Fraud Prevention Desk',
    spoofedNumber: '+1 (888) 240-9900 [Verified Bank ID Spoof]',
    claimedRole: 'Lead Wire Fraud Investigator',
    pressureTactic: 'Artificial Urgency',
    panicQuote:
      '"Alert! Two international Zelle transfers totaling $6,400 are clearing from your checking account right now. To freeze the outbound wire before settlement locks in 25 seconds, confirm your ATM PIN and the reversal passcode we just texted you!"',
    demandedAction: 'Provide ATM PIN and SMS reversal code before countdown ends',
    redFlags: [
      'Requesting ATM PIN and SMS OTP to "cancel" a transaction',
      '25-second settlement countdown designed to trigger the freeze reflex',
      'Spoofed bank 1-888 number',
    ],
    verificationChannel:
      'Disconnect the call. Turn your physical debit/credit card over and dial the official fraud number printed on the back.',
    debriefTakeaway:
      'Banks never require an OTP or PIN to block fraud. The attacker is actually initiating the transfer and needs your OTP to authorize it.',
  },
  {
    id: 'call-4',
    callerDisplay: 'IT Endpoint Defense (CrowdStrike Alert)',
    spoofedNumber: '+1 (212) 555-0143 [Helpdesk Ext]',
    claimedRole: 'Endpoint Containment Specialist',
    pressureTactic: 'Technical Crisis',
    panicQuote:
      '"Your laptop is beaconing ransomware telemetry to a command-and-control server! Before our automated firewall wipes your local drive in 30 seconds, press Win+R or open Terminal and paste the diagnostic relay string I\'m sending you!"',
    demandedAction: 'Execute an untrusted terminal command / remote access script',
    redFlags: [
      'Threat of immediate hard-drive wipe to prevent critical thinking',
      'Instructing user to run shell commands during an unsolicited call',
      'Bypassing standard MDM/EDR automated containment workflows',
    ],
    verificationChannel:
      'Hang up, disconnect from Wi-Fi if concerned, and contact the IT Helpdesk using the official company intranet number.',
    debriefTakeaway:
      'Pausing for 10 seconds breaks the panic spell—endpoint security tools isolate hosts automatically without asking users to paste terminal commands.',
  },
  {
    id: 'call-5',
    callerDisplay: 'HR Payroll & Direct Deposit Ops',
    spoofedNumber: '+1 (650) 555-0188 [Corporate HR]',
    claimedRole: 'Senior Payroll Compliance Officer',
    pressureTactic: 'Artificial Urgency',
    panicQuote:
      '"Your direct deposit routing failed our ACH audit 5 minutes ago. Payroll closes for the month in 30 seconds—log into the verification link I just texted you or confirm your Workday password and token right now so your paycheck isn\'t held!"',
    demandedAction: 'Disclose Workday credentials / MFA token over the phone',
    redFlags: [
      'Threatening immediate paycheck suspension',
      'Combining voice pressure with an unsolicited SMS phishing link (Vishing + Smishing)',
      'Asking for live password/token confirmation',
    ],
    verificationChannel:
      'End the call and navigate directly to your bookmarked HR/Payroll portal from your browser (never via SMS links).',
    debriefTakeaway:
      'Attackers pair phone calls with SMS links to create multi-channel pressure. Pausing and using a known bookmark stops payroll diversion.',
  },
  {
    id: 'call-6',
    callerDisplay: 'Cloud Infrastructure Trust & Safety',
    spoofedNumber: '+1 (206) 555-0172 [Cloud Ops]',
    claimedRole: 'Critical Account Abuse Investigator',
    pressureTactic: 'Technical Crisis',
    panicQuote:
      '"Someone leaked your production API keys and spun up 80 GPU instances! Your company is accruing $900/minute in charges. Approve the emergency IAM recovery push notification on your phone right now so we can roll back the cluster!"',
    demandedAction: 'Approve an unsolicited MFA push notification (MFA Fatigue / Bombing)',
    redFlags: [
      'Financial hemorrhage panic ($900/minute claim)',
      'Coercing approval of an uninitiated MFA push prompt',
      'Unsolicited inbound call regarding cloud console access',
    ],
    verificationChannel:
      'Deny the MFA push, hang up, and check your AWS/GCP billing & health dashboard directly via official console login.',
    debriefTakeaway:
      'Never approve an MFA push you did not initiate yourself. The caller is at your login screen waiting for you to tap Approve.',
  },
];

const DRILL_DURATION_SECONDS = 30;

export const PauseVerifySimulator: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<SuspiciousCallScenario>(
    () => SUSPICIOUS_CALL_POOL[0]
  );
  const [drillState, setDrillState] = useState<
    'ready' | 'active_freeze_drill' | 'verified_success' | 'timeout_freeze_fail' | 'comply_trap_fail'
  >('active_freeze_drill');
  const [timeLeft, setTimeLeft] = useState<number>(DRILL_DURATION_SECONDS);
  const [checkedSteps, setCheckedSteps] = useState<{
    breathe: boolean;
    spotManipulator: boolean;
  }>({
    breathe: false,
    spotManipulator: false,
  });

  // Session RAM-only telemetry metrics
  const [drillsCompleted, setDrillsCompleted] = useState<number>(0);
  const [verifiedStreak, setVerifiedStreak] = useState<number>(0);
  const [bestReactionSeconds, setBestReactionSeconds] = useState<number | null>(null);
  const [lastReactionSeconds, setLastReactionSeconds] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(Date.now());

  // Pick a random suspicious call scenario different from the current one
  const generateRandomScenario = (): SuspiciousCallScenario => {
    const candidates = SUSPICIOUS_CALL_POOL.filter((s) => s.id !== currentScenario.id);
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex] || SUSPICIOUS_CALL_POOL[0];
  };

  // Start or restart the 30-second Freeze-and-Assess drill with a randomly generated scenario
  const handleStartRandomDrill = (useCurrent = false) => {
    const nextScenario = useCurrent ? currentScenario : generateRandomScenario();
    setCurrentScenario(nextScenario);
    setTimeLeft(DRILL_DURATION_SECONDS);
    setCheckedSteps({ breathe: false, spotManipulator: false });
    setDrillState('active_freeze_drill');
    startTimeRef.current = Date.now();
  };

  // 30-second countdown timer
  useEffect(() => {
    if (drillState !== 'active_freeze_drill') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setDrillState('timeout_freeze_fail');
          setVerifiedStreak(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [drillState]);

  // User clicks the 'Verify' button before the 30-second timer expires
  const handleClickVerify = () => {
    if (drillState !== 'active_freeze_drill') return;

    const elapsed = startTimeRef.current
      ? Math.max(1, Math.min(30, Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10))
      : DRILL_DURATION_SECONDS - timeLeft;

    setLastReactionSeconds(elapsed);
    setBestReactionSeconds((prev) => (prev === null ? elapsed : Math.min(prev, elapsed)));
    setDrillsCompleted((prev) => prev + 1);
    setVerifiedStreak((prev) => prev + 1);
    setDrillState('verified_success');

    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#2BB5A0', '#5FD3BF', '#EBC385'],
      });
    } catch {
      // ignore
    }
  };

  // User falls for the panic trap and complies with caller demand
  const handleClickComplyTrap = () => {
    if (drillState !== 'active_freeze_drill') return;
    setVerifiedStreak(0);
    setDrillState('comply_trap_fail');
  };

  const progressPct = Math.round((timeLeft / DRILL_DURATION_SECONDS) * 100);

  return (
    <div className="space-y-6">
      {/* Top Command Panel */}
      <section className="xh-panel">
        <div className="xh-kicker">
          <span className="k">
            Anti-Panic Muscle Memory Trainer · 30-Second Freeze-and-Assess Protocol
          </span>
          <span className="tag">RAM-Only · Zero-AI Deterministic Simulation</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 pb-4 border-b border-[#C9D3D9]/15">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="text-lg sm:text-xl font-semibold text-[#EEF3F1] flex items-center gap-2.5">
              <Timer className="w-5 h-5 text-[#5FD3BF] shrink-0" />
              <span>&lsquo;Pause &amp; Verify&rsquo; 30-Second Freeze-and-Assess Drill</span>
            </h1>
            <p className="text-xs text-[#C6D1D6] leading-relaxed">
              <strong className="text-[#EBC385]">Why this drill matters:</strong> The &ldquo;freeze
              moment&rdquo; is the real risk in voice social engineering—people know hanging up is an
              option, but acute panic makes them forget it in the moment. Train your reflex to{' '}
              <strong className="text-[#5FD3BF]">pause, assess the pressure lever, and click Verify</strong>{' '}
              before the 30-second panic clock expires.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleStartRandomDrill(false)}
              className="xh-btn primary !py-2.5 !px-4 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>
                {drillState === 'active_freeze_drill'
                  ? 'Generate New Random Call'
                  : 'Launch 30s Freeze-and-Assess Drill'}
              </span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4">
          <div className="xh-metric">
            <div className="lbl">
              <span>01 · Countdown Window</span>
              <Timer className="w-3.5 h-3.5 text-[#EBC385]" />
            </div>
            <div
              className={`num ${
                drillState === 'active_freeze_drill' && timeLeft <= 10
                  ? 'text-rose-400'
                  : 'hi'
              }`}
            >
              {timeLeft}s
              <span className="text-xs font-normal text-[#A9B7BF] ml-1">/ 30s window</span>
            </div>
            <p>
              {drillState === 'active_freeze_drill'
                ? 'Active freeze-and-assess timer running'
                : '30-second cognitive circuit breaker'}
            </p>
          </div>

          <div className="xh-metric">
            <div className="lbl">
              <span>02 · Pause &amp; Verify Streak</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#5FD3BF]" />
            </div>
            <div className="num">
              {verifiedStreak}
              <span className="text-xs font-normal text-[#A9B7BF] ml-1.5">consecutive</span>
            </div>
            <p>Unbroken out-of-band verifications</p>
          </div>

          <div className="xh-metric">
            <div className="lbl">
              <span>03 · Assessment Speed</span>
              <Activity className="w-3.5 h-3.5 text-[#5FD3BF]" />
            </div>
            <div className="num hi">
              {lastReactionSeconds !== null ? `${lastReactionSeconds}s` : '—'}
              {bestReactionSeconds !== null && (
                <span className="text-xs font-normal text-[#A9B7BF] ml-1.5">
                  (best {bestReactionSeconds}s)
                </span>
              )}
            </div>
            <p>Time taken to pause &amp; trigger Verify</p>
          </div>

          <div className="xh-metric">
            <div className="lbl">
              <span>04 · Drills Verified</span>
              <Brain className="w-3.5 h-3.5 text-[#EBC385]" />
            </div>
            <div className="num">
              {drillsCompleted}
              <span className="text-xs font-normal text-[#A9B7BF] ml-1.5">calls neutralized</span>
            </div>
            <p>Simulated attack calls assessed in RAM</p>
          </div>
        </div>
      </section>

      {/* Main Simulation Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Suspicious Call Scenario & 30-Second Timer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0D1C2D] border border-[#3E6E86]/60 rounded-2xl p-6 text-[#EEF3F1] shadow-xl space-y-5 relative overflow-hidden">
            {/* Top Status Bar & Countdown Progress */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border ${
                      drillState === 'active_freeze_drill'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-400/40 animate-pulse'
                        : drillState === 'verified_success'
                        ? 'bg-[#2BB5A0]/20 text-[#5FD3BF] border-[#5FD3BF]/40'
                        : 'bg-[#102236] text-[#EBC385] border-[#3E6E86]/50'
                    }`}
                  >
                    <PhoneIncoming className="w-3.5 h-3.5" />
                    <span>
                      {drillState === 'active_freeze_drill'
                        ? 'LIVE SUSPICIOUS CALL — FREEZE & ASSESS'
                        : drillState === 'verified_success'
                        ? 'CALL ISOLATED — VERIFIED OUT-OF-BAND'
                        : drillState === 'timeout_freeze_fail'
                        ? 'TIMER EXPIRED — PANIC FREEZE OCCURRED'
                        : drillState === 'comply_trap_fail'
                        ? 'IMPULSE COMPLIANCE — SOCIAL ENGINEERING HIT'
                        : 'SCENARIO LOADED — READY FOR 30s DRILL'}
                    </span>
                  </span>

                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#102236] text-[#EBC385] border border-[#EBC385]/30">
                    Trigger: {currentScenario.pressureTactic}
                  </span>
                </div>

                {/* Circular / Numeric 30s Countdown Readout */}
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[11px] text-[#A9B7BF]">Freeze Timer:</span>
                  <span
                    className={`px-2.5 py-1 rounded text-sm font-bold tabular-nums border ${
                      drillState === 'active_freeze_drill' && timeLeft <= 10
                        ? 'bg-rose-950/90 text-rose-300 border-rose-500/50 animate-bounce'
                        : 'bg-[#081420] text-[#5FD3BF] border-[#5FD3BF]/40'
                    }`}
                  >
                    00:{timeLeft.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* 30-Second Visual Countdown Bar */}
              <div className="w-full h-2 bg-[#081420] rounded-full overflow-hidden border border-[#3E6E86]/30">
                <div
                  className={`h-full transition-all duration-700 ${
                    drillState === 'verified_success'
                      ? 'bg-[#2BB5A0]'
                      : timeLeft <= 10
                      ? 'bg-rose-500'
                      : timeLeft <= 20
                      ? 'bg-[#D79A45]'
                      : 'bg-[#5FD3BF]'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Caller Identity HUD */}
            <div className="p-4 rounded-xl bg-[#081420] border border-[#3E6E86]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 ${
                    drillState === 'active_freeze_drill'
                      ? 'bg-rose-950/50 border-rose-400 text-rose-300 animate-pulse'
                      : 'bg-[#102236] border-[#5FD3BF]/50 text-[#5FD3BF]'
                  }`}
                >
                  <Volume2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#EEF3F1]">
                    {currentScenario.callerDisplay}
                  </div>
                  <div className="text-xs font-mono text-rose-400 mt-0.5">
                    {currentScenario.spoofedNumber}
                  </div>
                  <div className="text-[11px] font-mono text-[#A9B7BF] mt-0.5">
                    Claimed Authority: <span className="text-[#EEF3F1]">{currentScenario.claimedRole}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleStartRandomDrill(false)}
                className="xh-btn !py-1.5 !px-3 !text-xs self-start sm:self-center shrink-0 cursor-pointer"
                title="Generate another random suspicious call scenario"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EBC385]" />
                <span>Randomize Scenario</span>
              </button>
            </div>

            {/* High-Pressure Caller Audio Transcript Prompt */}
            <div className="p-4 rounded-xl bg-[#102236] border-l-4 border-[#D79A45] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#EBC385]">
                <span>INBOUND VOICE PRESSURE STREAM (SIMULATED ATTACK CALL)</span>
                <span>DEMAND: {currentScenario.demandedAction.toUpperCase()}</span>
              </div>
              <p className="text-sm text-[#EEF3F1] leading-relaxed font-serif italic">
                {currentScenario.panicQuote}
              </p>
            </div>

            {/* Interactive 3-Step 'Freeze-and-Assess' Guided Checklist */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#5FD3BF] uppercase tracking-wider font-semibold">
                  30-Second Freeze-and-Assess Checklist (Break the Panic Loop):
                </span>
                <span className="text-[#A9B7BF] text-[11px]">
                  Click Verify before timer hits 00:00
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setCheckedSteps((prev) => ({ ...prev, breathe: !prev.breathe }))
                  }
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                    checkedSteps.breathe
                      ? 'bg-[#102236] border-[#5FD3BF] text-[#EEF3F1]'
                      : 'bg-[#081420] border-[#3E6E86]/40 text-[#C6D1D6] hover:border-[#5FD3BF]/50'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      checkedSteps.breathe ? 'text-[#5FD3BF]' : 'text-[#3E6E86]'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-[#EEF3F1]">
                      1. Pause &amp; Name the Panic Lever
                    </div>
                    <p className="text-[11px] text-[#A9B7BF] mt-0.5">
                      Recognize artificial countdowns ({currentScenario.pressureTactic}) meant to
                      hijack judgment.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCheckedSteps((prev) => ({
                      ...prev,
                      spotManipulator: !prev.spotManipulator,
                    }))
                  }
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                    checkedSteps.spotManipulator
                      ? 'bg-[#102236] border-[#5FD3BF] text-[#EEF3F1]'
                      : 'bg-[#081420] border-[#3E6E86]/40 text-[#C6D1D6] hover:border-[#5FD3BF]/50'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      checkedSteps.spotManipulator ? 'text-[#5FD3BF]' : 'text-[#3E6E86]'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-[#EEF3F1]">
                      2. Refuse In-Call Credential / Wire Action
                    </div>
                    <p className="text-[11px] text-[#A9B7BF] mt-0.5">
                      Never satisfy &ldquo;{currentScenario.demandedAction}&rdquo; on an inbound
                      call.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Primary Action Buttons: Start Drill OR Verify vs Impulse Trap */}
            {drillState === 'ready' ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleStartRandomDrill(true)}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#2BB5A0] hover:bg-[#5FD3BF] text-[#04211B] font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Timer className="w-4 h-4" />
                  <span>START 30-SECOND FREEZE-AND-ASSESS DRILL NOW</span>
                </button>
              </div>
            ) : drillState === 'active_freeze_drill' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClickVerify}
                  className="sm:col-span-2 py-3.5 px-5 rounded-xl bg-[#2BB5A0] hover:bg-[#5FD3BF] text-[#04211B] font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(43,181,160,0.4)] transition cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>VERIFY (PAUSE, HANG UP &amp; CHECK OUT-OF-BAND)</span>
                </button>

                <button
                  type="button"
                  onClick={handleClickComplyTrap}
                  className="py-3.5 px-4 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-500/40 font-mono text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Simulated panic compliance trap"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Comply with Caller</span>
                </button>
              </div>
            ) : (
              /* Post-Drill Feedback Banner */
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  drillState === 'verified_success'
                    ? 'bg-emerald-950/50 border-[#5FD3BF]/50 text-[#EEF3F1]'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {drillState === 'verified_success' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#5FD3BF] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h3 className="text-sm font-bold font-mono">
                        {drillState === 'verified_success'
                          ? `PAUSE & VERIFY HABIT REINFORCED (${lastReactionSeconds}s response)`
                          : drillState === 'timeout_freeze_fail'
                          ? '30-SECOND FREEZE WINDOW EXPIRED — PANIC PARALYSIS'
                          : 'IMPULSE COMPLIANCE TRAP TRIGGERED'}
                      </h3>
                      <p className="text-xs text-[#C6D1D6] mt-1 leading-relaxed">
                        {drillState === 'verified_success'
                          ? currentScenario.verificationChannel
                          : drillState === 'timeout_freeze_fail'
                          ? 'Staying on the line past 30 seconds allows social engineers to keep escalating fear until you comply. Build the reflex to click Verify and disconnect immediately.'
                          : 'Reacting to the caller’s countdown without pausing to verify hands control directly to the attacker.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#081420]/90 border border-[#3E6E86]/40 text-xs text-[#EBC385] font-mono">
                  <strong>Defensive Takeaway:</strong> {currentScenario.debriefTakeaway}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleStartRandomDrill(false)}
                    className="xh-btn primary !py-2 !px-4 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Next Random Suspicious Call (30s Drill)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartRandomDrill(true)}
                    className="xh-btn !py-2 !px-3 cursor-pointer"
                  >
                    <span>Retry Same Scenario</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Red Flag Decomposition & Organizational 'Pause & Verify' Playbook (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scenario Red Flag Inspector */}
          <div className="bg-white border border-[#D9DDD3] rounded-xl p-6 space-y-4 shadow-xs text-xs">
            <div>
              <span className="rm-kicker">01 / Live Scenario Decomposition</span>
              <h2 className="text-sm font-semibold text-[#16232F] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D79A45]" />
                Suspicious Call Indicators &amp; Verification Protocol
              </h2>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#4B5A66] font-semibold block">
                Red Flags in Current Call Prompt:
              </span>
              {currentScenario.redFlags.map((flag, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] flex items-start gap-2.5 text-[#16232F]"
                >
                  <span className="w-5 h-5 rounded-full bg-[#0E2238] text-[#5FD3BF] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    0{i + 1}
                  </span>
                  <span className="leading-relaxed">{flag}</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="font-mono text-[11px] font-semibold text-emerald-900 flex items-center gap-1.5">
                <PhoneOff className="w-3.5 h-3.5 text-emerald-700" />
                <span>Required Out-of-Band Verification Action:</span>
              </div>
              <p className="text-emerald-950 leading-relaxed">
                {currentScenario.verificationChannel}
              </p>
            </div>
          </div>

          {/* Why the Freeze Moment Happens & How Pause-and-Verify Defeats It */}
          <div className="bg-white border border-[#D9DDD3] rounded-xl p-6 space-y-3.5 shadow-xs text-xs">
            <div>
              <span className="rm-kicker">02 / Behavioral Defense Science</span>
              <h3 className="text-sm font-semibold text-[#16232F] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0E2238]" />
                Overcoming the Social Engineering &ldquo;Freeze Moment&rdquo;
              </h3>
            </div>

            <p className="text-[#4B5A66] leading-relaxed">
              During a real vishing or deepfake attack call, callers weaponize authority and
              artificial countdowns so the brain enters a sympathetic stress response. Even when
              defenders know they <em>can</em> hang up, panic causes cognitive tunneling.
            </p>

            <div className="space-y-2 text-[#16232F]">
              <div className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
                <strong className="font-mono text-[11px] text-[#0E2238] block">
                  STEP 1 · THE 5-SECOND COGNITIVE PAUSE
                </strong>
                <span className="text-[#4B5A66] text-[11px]">
                  Any inbound call demanding an OTP, wire override, or terminal command is an
                  automatic trigger to stop speaking and pause.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
                <strong className="font-mono text-[11px] text-[#0E2238] block">
                  STEP 2 · TERMINATE INBOUND AUDIO CHANNEL
                </strong>
                <span className="text-[#4B5A66] text-[11px]">
                  Do not negotiate with the caller or ask them to prove who they are on the same
                  line. Hang up cleanly.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
                <strong className="font-mono text-[11px] text-[#0E2238] block">
                  STEP 3 · OUT-OF-BAND VERIFICATION
                </strong>
                <span className="text-[#4B5A66] text-[11px]">
                  Verify independently via an internal directory number, Slack huddle, or the
                  number on the back of your physical card.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
