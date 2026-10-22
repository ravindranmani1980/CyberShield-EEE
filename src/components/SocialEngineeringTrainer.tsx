import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  PhoneOff,
  PhoneForwarded,
  ShieldAlert,
  ShieldCheck,
  Volume2,
  VolumeX,
  AlertCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Sparkles,
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
  const [isAudioMuted, setIsAudioMuted] = useState(false);

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
        feedback: 'Excellent defense! Terminating unsolicited inbound calls requesting urgent action eliminates the attack surface.',
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
              colors: ['#10b981', '#06b6d4'],
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

  const getTriggerBadge = (trigger: string) => {
    switch (trigger) {
      case 'Urgency':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Authority':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'Fear':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Scenario Chooser */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-amber-400" />
            Vishing, OTP & ATM PIN Social Engineering Defense Trainer
          </h2>
          <p className="text-xs text-slate-400">
            Interactive simulated voice scams. Practice confronting pressure tactics, urgent money wires, and credential extraction.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition border text-xs font-medium ${
                selectedScenarioId === s.id
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {s.attackVector}: {s.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Smartphone Simulator on Left, Psychological Radar & Takeaways on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Smartphone Call Screen (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="mx-auto max-w-sm rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl overflow-hidden relative">
            {/* Phone Notch & Status Bar */}
            <div className="h-6 bg-slate-900 flex items-center justify-between px-6 text-[10px] font-mono text-slate-400 border-b border-slate-800/60">
              <span>09:41</span>
              <div className="w-16 h-3 bg-slate-950 rounded-b-xl border border-slate-800/80" />
              <span>5G 100%</span>
            </div>

            {/* Simulated Inbound Call HUD */}
            <div className="p-6 text-center space-y-3 bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-amber-500/50 mx-auto flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40 animate-pulse">
                <PhoneCall className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {scenario.callerName}
                </h3>
                <p className="text-xs text-rose-400 font-mono mt-0.5">
                  {scenario.spoofedCallerId} (Spoofed Caller ID)
                </p>
                <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {scenario.callerRole}
                </span>
              </div>

              {callState === 'ringing' && (
                <div className="pt-6 flex items-center justify-center gap-8">
                  <button
                    onClick={handleDeclineCall}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-600 group-hover:bg-rose-500 flex items-center justify-center text-white transition shadow-lg shadow-rose-950">
                      <PhoneOff className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Decline</span>
                  </button>

                  <button
                    onClick={handleAnswerCall}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center text-white transition shadow-lg shadow-emerald-950 animate-bounce">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">Answer Call</span>
                  </button>
                </div>
              )}
            </div>

            {/* In-Call Dialogue Area */}
            {callState !== 'ringing' && (
              <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3 min-h-[300px] flex flex-col justify-between">
                {/* Dialogue Stream */}
                <div className="space-y-2.5 overflow-y-auto max-h-60 pr-1 text-xs">
                  {dialogueHistory.map((d, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl ${
                        d.speaker === 'caller'
                          ? 'bg-slate-900 border border-slate-800 text-slate-200'
                          : d.isSafe
                          ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 ml-4'
                          : 'bg-rose-950/40 border border-rose-500/40 text-rose-200 ml-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                        <span>{d.speaker === 'caller' ? scenario.callerName : 'You'}</span>
                      </div>
                      <p className="leading-relaxed">{d.text}</p>
                      {d.feedback && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                          {d.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Response Options */}
                {callState === 'in_call' && currentNode.options && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">
                      Choose Your Response:
                    </span>
                    {currentNode.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(opt)}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs transition leading-snug"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                )}

                {callState === 'ended' && (
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => handleSelectScenario(selectedScenarioId)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 mx-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Replay Scenario
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Psychological Radar & Golden Defense Rules (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Awareness Score HUD */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400">
                Vishing Resistance Score
              </span>
              <div className="text-2xl font-bold text-white mt-1">
                {score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Social Engineering Levers Radar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-slate-300 uppercase font-mono text-xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Psychological Manipulation Levers Used by Attackers
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="font-semibold text-rose-400 block font-mono text-[11px]">
                  1. Artificial Urgency
                </span>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  "Only 45 seconds before the wire clears!" &mdash; rushes victims into bypassing standard skepticism.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="font-semibold text-indigo-400 block font-mono text-[11px]">
                  2. False Authority
                </span>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  "Senior Fraud Inspector" / "Tier-3 IT" &mdash; exploits deference to corporate hierarchy.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="font-semibold text-amber-400 block font-mono text-[11px]">
                  3. Fear of Consequence
                </span>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  "You will lose liability protection!" &mdash; creates panic of catastrophic personal loss.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="font-semibold text-cyan-400 block font-mono text-[11px]">
                  4. Caller ID Spoofing
                </span>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  Displaying your real bank's 1-800 number to trick you into trusting the inbound call.
                </p>
              </div>
            </div>
          </div>

          {/* Mandatory Golden Rules */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 text-xs">
            <h4 className="font-bold text-emerald-300 font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              The Cardinal Rules of Phone & Money Defense
            </h4>

            <ul className="space-y-2 text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>
                  <strong>NEVER share an OTP or 2FA code:</strong> Genuine banks, Amazon, Google, or Apple will NEVER call asking you to read a temporary passkey. The SMS itself warns you.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>
                  <strong>NEVER disclose ATM or Card PINs:</strong> Your 4-digit or 6-digit PIN is strictly for you at the terminal or ATM. IT or bank personnel have zero legitimate need for it.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>
                  <strong>Out-of-Band Verification:</strong> If a caller claims an unauthorized wire is pending, immediately hang up. Turn your debit card over and dial the official phone number printed on the physical plastic.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
