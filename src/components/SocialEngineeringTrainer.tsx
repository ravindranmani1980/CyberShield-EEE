import React, { useState } from 'react';
import {
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  Award,
  RotateCcw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VISHING_SCENARIOS } from '../data/vishingScenarios';
import { VishingScenario, VishingDialogueNode } from '../types';

export const SocialEngineeringTrainer: React.FC = () => {
  const [scenarios] = useState<VishingScenario[]>(VISHING_SCENARIOS);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(VISHING_SCENARIOS[0].id);

  // Call state machine: 'ringing' | 'in_call' | 'ended'
  const [callState, setCallState] = useState<'ringing' | 'in_call' | 'ended'>('ringing');
  const [currentNodeId, setCurrentNodeId] = useState<string>(VISHING_SCENARIOS[0].rootNodeId);
  const [score, setScore] = useState(100);
  const [dialogueHistory, setDialogueHistory] = useState<
    { speaker: 'caller' | 'user'; text: string; feedback?: string; isSafe?: boolean }[]
  >([]);

  const scenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
  const currentNode: VishingDialogueNode =
    scenario.dialogueTree[currentNodeId] || scenario.dialogueTree[scenario.rootNodeId];

  // Reset scenario
  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id);
    const newScen = scenarios.find((s) => s.id === id) || scenarios[0];
    setCallState('ringing');
    setCurrentNodeId(newScen.rootNodeId);
    setScore(100);
    setDialogueHistory([]);
  };

  // Start Call
  const handleAnswerCall = () => {
    setCallState('in_call');
    setDialogueHistory([
      {
        speaker: 'caller',
        text: currentNode.callerStatement,
      },
    ]);
  };

  // Reject / Hang up
  const handleDeclineCall = () => {
    setCallState('ended');
    setDialogueHistory((prev) => [
      ...prev,
      {
        speaker: 'user',
        text: '[Terminated Call immediately and blocked spoofed number]',
        feedback:
          'Excellent defense! Terminating unsolicited inbound calls requesting urgent action eliminates the attack surface.',
        isSafe: true,
      },
    ]);
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  // User chooses a dialogue branch
  const handleSelectOption = (option: VishingDialogueNode['options'][0]) => {
    const nextScore = Math.max(0, score + option.scoreDelta);
    setScore(nextScore);

    const updatedHistory = [
      ...dialogueHistory,
      {
        speaker: 'user' as const,
        text: option.text,
        feedback: option.feedback,
        isSafe: option.isSafeResponse,
      },
    ];

    if (option.nextNodeId && scenario.dialogueTree[option.nextNodeId]) {
      const nextNode = scenario.dialogueTree[option.nextNodeId];
      setCurrentNodeId(option.nextNodeId);
      updatedHistory.push({
        speaker: 'caller',
        text: nextNode.callerStatement,
      });

      // If no options left, call is ended
      if (!nextNode.options || nextNode.options.length === 0) {
        setCallState('ended');
        if (option.isSafeResponse) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.7 },
              colors: ['#2BB5A0', '#5FD3BF'],
            });
          } catch {
            // ignore
          }
        }
      }
    } else {
      setCallState('ended');
    }

    setDialogueHistory(updatedHistory);
  };

  return (
    <div className="space-y-6">
      {/* Postrix Command Header */}
      <section className="xh-panel">
        <div className="xh-kicker">
          <span className="k">Voice Phishing (Vishing) &amp; Out-of-Band OTP Defense</span>
          <span className="tag">Caller ID Spoofing · Urgent Wire Pretext</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-[#C9D3D9]/12">
          <div>
            <h2 className="text-lg font-semibold text-[#EEF3F1] flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-[#EBC385]" />
              Vishing, OTP &amp; ATM PIN Social Engineering Defense Trainer
            </h2>
            <p className="text-xs text-[#A9B7BF] mt-0.5">
              Interactive simulated voice scams. Practice confronting pressure tactics, urgent money wires, and credential extraction.
            </p>
          </div>

          <div className="xh-metric !py-2 !px-4 flex items-center gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#5FD3BF] block">
                Resistance Score
              </span>
              <span className="text-xl font-mono font-semibold text-[#EEF3F1] tabular-nums">
                {score} <span className="text-xs text-[#A9B7BF] font-normal">/ 100</span>
              </span>
            </div>
            <Award className="w-5 h-5 text-[#EBC385]" />
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-4 text-xs">
          <span className="text-[#A9B7BF] font-mono text-[11px] uppercase mr-1 shrink-0">
            Select Scenario:
          </span>
          {scenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectScenario(s.id)}
              className={`xh-btn !py-1.5 !px-3 whitespace-nowrap shrink-0 ${
                selectedScenarioId === s.id
                  ? '!border-[#5FD3BF] !bg-[#5FD3BF]/15 !text-[#5FD3BF]'
                  : ''
              }`}
            >
              {s.attackVector}: {s.title.split(':')[0]}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid: Interactive Smartphone Simulator on Left, Psychological Radar & Takeaways on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Smartphone Call Screen (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="mx-auto max-w-sm rounded-3xl bg-[#081420] border-4 border-[#0E2238] shadow-2xl overflow-hidden relative">
            {/* Phone Notch & Status Bar */}
            <div className="h-6 bg-[#0D1C2D] flex items-center justify-between px-6 text-[10px] font-mono text-[#A9B7BF] border-b border-[#3E6E86]/40">
              <span>09:41</span>
              <div className="w-16 h-3 bg-[#081420] rounded-b-xl border border-[#3E6E86]/40" />
              <span>5G 100%</span>
            </div>

            {/* Simulated Inbound Call HUD */}
            <div className="p-6 text-center space-y-3 bg-gradient-to-b from-[#0D1C2D] to-[#081420]">
              <div className="w-16 h-16 rounded-full bg-[#102236] border-2 border-[#D79A45] mx-auto flex items-center justify-center text-[#EBC385] shadow-lg animate-pulse">
                <PhoneCall className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#EEF3F1] tracking-tight">
                  {scenario.callerName}
                </h3>
                <p className="text-xs text-red-400 font-mono mt-0.5">
                  {scenario.spoofedCallerId} (Spoofed Caller ID)
                </p>
                <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#102236] text-[#5FD3BF] border border-[#3E6E86]/40">
                  {scenario.callerRole}
                </span>
              </div>

              {callState === 'ringing' && (
                <div className="pt-6 flex items-center justify-center gap-8">
                  <button
                    type="button"
                    onClick={handleDeclineCall}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center text-white transition shadow-lg">
                      <PhoneOff className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-[#A9B7BF] font-medium">Decline</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAnswerCall}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#2BB5A0] group-hover:bg-[#5FD3BF] flex items-center justify-center text-[#04211B] transition shadow-lg animate-bounce">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-[#5FD3BF] font-medium">Answer Call</span>
                  </button>
                </div>
              )}
            </div>

            {/* In-Call Dialogue Area */}
            {callState !== 'ringing' && (
              <div className="p-4 bg-[#081420] border-t border-[#3E6E86]/40 space-y-3 min-h-[300px] flex flex-col justify-between">
                {/* Dialogue Stream */}
                <div className="space-y-2.5 overflow-y-auto max-h-60 pr-1 text-xs">
                  {dialogueHistory.map((d, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl ${
                        d.speaker === 'caller'
                          ? 'bg-[#102236] border border-[#3E6E86]/50 text-[#EEF3F1]'
                          : d.isSafe
                          ? 'bg-emerald-950/60 border border-[#5FD3BF]/40 text-[#EEF3F1] ml-4'
                          : 'bg-red-950/60 border border-red-400/40 text-red-100 ml-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#A9B7BF] mb-1">
                        <span>{d.speaker === 'caller' ? scenario.callerName : 'You'}</span>
                      </div>
                      <p className="leading-relaxed">{d.text}</p>
                      {d.feedback && (
                        <div className="mt-2 pt-2 border-t border-[#3E6E86]/40 text-[11px] font-mono text-[#5FD3BF]">
                          {d.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Response Options */}
                {callState === 'in_call' && currentNode.options && (
                  <div className="space-y-2 pt-2 border-t border-[#3E6E86]/40">
                    <span className="text-[10px] font-mono text-[#5FD3BF] uppercase block">
                      Choose Your Response:
                    </span>
                    {currentNode.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        className="w-full text-left p-2.5 rounded-lg bg-[#102236] hover:bg-[#0D1C2D] border border-[#3E6E86]/50 hover:border-[#5FD3BF] text-[#EEF3F1] text-xs transition leading-snug cursor-pointer"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                )}

                {callState === 'ended' && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleSelectScenario(selectedScenarioId)}
                      className="xh-btn primary mx-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Replay Scenario</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Psychological Radar & Golden Defense Rules (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Social Engineering Levers Radar */}
          <div className="bg-white border border-[#D9DDD3] rounded-xl p-6 space-y-3 text-xs shadow-xs">
            <div>
              <span className="rm-kicker">01 / Adversary Tradecraft</span>
              <h3 className="font-semibold text-sm text-[#16232F] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D79A45]" />
                Psychological Manipulation Levers Used by Attackers
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
                <span className="font-semibold text-red-800 block font-mono text-[11px]">
                  1. Artificial Urgency
                </span>
                <p className="text-[#4B5A66] text-[11px] mt-1 leading-relaxed">
                  &ldquo;Only 45 seconds before the wire clears!&rdquo; — rushes victims into bypassing standard skepticism.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
                <span className="font-semibold text-[#0E2238] block font-mono text-[11px]">
                  2. False Authority
                </span>
                <p className="text-[#4B5A66] text-[11px] mt-1 leading-relaxed">
                  &ldquo;Senior Fraud Inspector&rdquo; / &ldquo;Tier-3 IT&rdquo; — exploits deference to corporate hierarchy.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
                <span className="font-semibold text-amber-800 block font-mono text-[11px]">
                  3. Fear of Consequence
                </span>
                <p className="text-[#4B5A66] text-[11px] mt-1 leading-relaxed">
                  &ldquo;You will lose liability protection!&rdquo; — creates panic of catastrophic personal loss.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
                <span className="font-semibold text-emerald-800 block font-mono text-[11px]">
                  4. Caller ID Spoofing
                </span>
                <p className="text-[#4B5A66] text-[11px] mt-1 leading-relaxed">
                  Displaying your real bank&apos;s 1-800 number to trick you into trusting the inbound call.
                </p>
              </div>
            </div>
          </div>

          {/* Mandatory Golden Rules */}
          <div className="bg-white border border-[#D9DDD3] rounded-xl p-6 space-y-3 text-xs shadow-xs">
            <div>
              <span className="rm-kicker">02 / Non-Negotiable Protocols</span>
              <h4 className="font-semibold text-sm text-[#16232F] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                The Cardinal Rules of Phone &amp; Money Defense
              </h4>
            </div>

            <ul className="space-y-2.5 text-[#4B5A66] leading-relaxed">
              <li className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] flex items-start gap-2">
                <span className="text-emerald-700 font-bold">·</span>
                <span>
                  <strong className="text-[#16232F]">NEVER share an OTP or 2FA code:</strong> Genuine banks, Amazon, Google, or Apple will NEVER call asking you to read a temporary passkey. The SMS itself warns you.
                </span>
              </li>
              <li className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] flex items-start gap-2">
                <span className="text-emerald-700 font-bold">·</span>
                <span>
                  <strong className="text-[#16232F]">NEVER disclose ATM or Card PINs:</strong> Your 4-digit or 6-digit PIN is strictly for you at the terminal or ATM. IT or bank personnel have zero legitimate need for it.
                </span>
              </li>
              <li className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] flex items-start gap-2">
                <span className="text-emerald-700 font-bold">·</span>
                <span>
                  <strong className="text-[#16232F]">Out-of-Band Verification:</strong> If a caller claims an unauthorized wire is pending, immediately hang up. Turn your debit card over and dial the official phone number printed on the physical plastic.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
