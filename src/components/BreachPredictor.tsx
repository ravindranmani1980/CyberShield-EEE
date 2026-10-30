import React, { useState } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  GitCommit,
  CheckCircle2,
  Sliders,
  Activity,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SecurityTelemetry, BreachPredictionResult } from '../types';
import { calculateHeuristicBreachProbability } from '../lib/localAnalysis';

export const BreachPredictor: React.FC = () => {
  // Telemetry Inputs
  const [telemetry, setTelemetry] = useState<SecurityTelemetry>({
    mfaCoverage: 78,
    unpatchedCves: 3,
    phishingFailureRate: 14,
    edrCoverage: 88,
    exposedServices: 2,
    habitAdherence: 82,
    darkWebMentions: 3,
    anomalousLogins: 4,
  });

  const [prediction, setPrediction] = useState<BreachPredictionResult | null>(() =>
    calculateHeuristicBreachProbability({
      mfaCoverage: 78,
      unpatchedCves: 3,
      phishingFailureRate: 14,
      edrCoverage: 88,
      exposedServices: 2,
      habitAdherence: 82,
      darkWebMentions: 3,
      anomalousLogins: 4,
    })
  );
  const [loading, setLoading] = useState(false);

  // Run deterministic prediction 100% locally in browser RAM (Zero-AI Mode)
  const handleRunPrediction = () => {
    setLoading(true);
    setTimeout(() => {
      const resolvedData = calculateHeuristicBreachProbability(telemetry);
      setPrediction(resolvedData);
      setLoading(false);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {
        // ignore
      }
    }, 150);
  };

  // Quick preset configurations
  const applyPreset = (type: 'current' | 'hardened' | 'vulnerable') => {
    let nextTelemetry: SecurityTelemetry;
    if (type === 'hardened') {
      nextTelemetry = {
        mfaCoverage: 100,
        unpatchedCves: 0,
        phishingFailureRate: 3,
        edrCoverage: 99,
        exposedServices: 0,
        habitAdherence: 96,
        darkWebMentions: 0,
        anomalousLogins: 0,
      };
    } else if (type === 'vulnerable') {
      nextTelemetry = {
        mfaCoverage: 45,
        unpatchedCves: 9,
        phishingFailureRate: 32,
        edrCoverage: 60,
        exposedServices: 6,
        habitAdherence: 40,
        darkWebMentions: 8,
        anomalousLogins: 12,
      };
    } else {
      nextTelemetry = {
        mfaCoverage: 78,
        unpatchedCves: 3,
        phishingFailureRate: 14,
        edrCoverage: 88,
        exposedServices: 2,
        habitAdherence: 82,
        darkWebMentions: 3,
        anomalousLogins: 4,
      };
    }
    setTelemetry(nextTelemetry);
    setPrediction(calculateHeuristicBreachProbability(nextTelemetry));
  };

  const getRiskTheme = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-50 border-red-300 text-red-950';
      case 'HIGH':
        return 'bg-amber-50 border-amber-300 text-amber-950';
      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-300 text-yellow-950';
      default:
        return 'bg-emerald-50 border-emerald-300 text-emerald-950';
    }
  };

  return (
    <div className="space-y-6">
      {/* Postrix Command Header */}
      <section className="xh-panel">
        <div className="xh-kicker">
          <span className="k">Deterministic Threat Modeling &amp; MITRE ATT&amp;CK Forecasting · Zero-AI Mode</span>
          <span className="tag">Multi-Signal Telemetry · 100% Local RAM</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div>
            <h2 className="text-lg font-semibold text-[#EEF3F1] flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-[#5FD3BF]" />
              Deterministic Breach Probability &amp; Risk Forecasting Engine
            </h2>
            <p className="text-xs text-[#A9B7BF] mt-0.5">
              Synthesizes operational security telemetry 100% locally in browser RAM to forecast breach likelihoods with zero AI and zero storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Presets */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#A9B7BF] font-mono text-[11px] mr-1">Simulate Posture:</span>
              <button
                type="button"
                onClick={() => applyPreset('vulnerable')}
                className="xh-btn !py-1.5 !px-2.5 !text-xs !text-red-300"
              >
                Degraded
              </button>
              <button
                type="button"
                onClick={() => applyPreset('current')}
                className="xh-btn !py-1.5 !px-2.5 !text-xs !text-[#EBC385]"
              >
                Typical
              </button>
              <button
                type="button"
                onClick={() => applyPreset('hardened')}
                className="xh-btn !py-1.5 !px-2.5 !text-xs !text-[#5FD3BF]"
              >
                Hardened (Zero-Trust)
              </button>
            </div>

            <button
              type="button"
              onClick={handleRunPrediction}
              disabled={loading}
              className="xh-btn primary disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Forecast Breach Probability</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Telemetry Sliders on Left, ML Prediction Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Telemetry Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#D9DDD3] rounded-xl p-6 text-xs space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="rm-kicker">01 / Posture Inputs</span>
                <h3 className="font-semibold text-sm text-[#16232F] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0E2238]" /> Operational Posture Telemetry
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#4B5A66]">Live Weights</span>
            </div>

            {/* Slider 1: MFA */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#16232F] font-medium">
                <span>MFA / Passkey Coverage</span>
                <span className="font-mono text-[#0E2238] font-bold tabular-nums">
                  {telemetry.mfaCoverage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={telemetry.mfaCoverage}
                onChange={(e) =>
                  setTelemetry({ ...telemetry, mfaCoverage: Number(e.target.value) })
                }
                className="w-full accent-[#0E2238]"
              />
            </div>

            {/* Slider 2: CVEs */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#16232F] font-medium">
                <span>Unpatched Critical / High CVEs</span>
                <span className="font-mono text-red-700 font-bold tabular-nums">
                  {telemetry.unpatchedCves}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                value={telemetry.unpatchedCves}
                onChange={(e) =>
                  setTelemetry({ ...telemetry, unpatchedCves: Number(e.target.value) })
                }
                className="w-full accent-red-700"
              />
            </div>

            {/* Slider 3: Phishing Failure Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#16232F] font-medium">
                <span>Simulated Phishing Failure Rate</span>
                <span className="font-mono text-[#D79A45] font-bold tabular-nums">
                  {telemetry.phishingFailureRate}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={telemetry.phishingFailureRate}
                onChange={(e) =>
                  setTelemetry({ ...telemetry, phishingFailureRate: Number(e.target.value) })
                }
                className="w-full accent-[#D79A45]"
              />
            </div>

            {/* Slider 4: EDR Coverage */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#16232F] font-medium">
                <span>EDR Endpoint Agent Coverage</span>
                <span className="font-mono text-emerald-700 font-bold tabular-nums">
                  {telemetry.edrCoverage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={telemetry.edrCoverage}
                onChange={(e) =>
                  setTelemetry({ ...telemetry, edrCoverage: Number(e.target.value) })
                }
                className="w-full accent-emerald-700"
              />
            </div>

            {/* Slider 5: Exposed Services */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#16232F] font-medium">
                <span>Public Exposed Services / Shadow IT</span>
                <span className="font-mono text-red-700 font-bold tabular-nums">
                  {telemetry.exposedServices}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={telemetry.exposedServices}
                onChange={(e) =>
                  setTelemetry({ ...telemetry, exposedServices: Number(e.target.value) })
                }
                className="w-full accent-red-700"
              />
            </div>

            {/* Slider 6: Habit Adherence */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#16232F] font-medium">
                <span>Security Routine Habit Adherence</span>
                <span className="font-mono text-[#0E2238] font-bold tabular-nums">
                  {telemetry.habitAdherence}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={telemetry.habitAdherence}
                onChange={(e) =>
                  setTelemetry({ ...telemetry, habitAdherence: Number(e.target.value) })
                }
                className="w-full accent-[#0E2238]"
              />
            </div>

            {/* Slider 7: Dark Web Mentions */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#16232F] font-medium">
                <span>Dark Web Leaked Credential Mentions</span>
                <span className="font-mono text-[#D79A45] font-bold tabular-nums">
                  {telemetry.darkWebMentions}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={telemetry.darkWebMentions}
                onChange={(e) =>
                  setTelemetry({ ...telemetry, darkWebMentions: Number(e.target.value) })
                }
                className="w-full accent-[#D79A45]"
              />
            </div>
          </div>
        </div>

        {/* Right: ML Forecast Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {prediction ? (
            <>
              {/* Breach Likelihood Card */}
              <div
                className={`p-5 rounded-xl border shadow-xs transition-all ${getRiskTheme(
                  prediction.riskLevel
                )}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider block font-semibold">
                      90-Day Predicted Breach Likelihood
                    </span>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="text-4xl font-mono font-bold tracking-tight tabular-nums">
                        {prediction.probability}%
                      </span>
                      <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-white/80 border border-black/15">
                        {prediction.riskLevel} RISK TIER
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/80 border border-black/10">
                    <Activity className="w-7 h-7 text-[#0E2238]" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-black/10">
                  <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        prediction.probability > 70
                          ? 'bg-red-600'
                          : prediction.probability > 45
                          ? 'bg-amber-600'
                          : prediction.probability > 25
                          ? 'bg-yellow-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${prediction.probability}%` }}
                    />
                  </div>
                </div>

                <p className="mt-3 text-xs text-[#16232F] leading-relaxed font-sans">
                  {prediction.executiveSummary}
                </p>
              </div>

              {/* Top 3 Predicted Vectors */}
              <div className="bg-white border border-[#D9DDD3] rounded-xl p-5 text-xs shadow-xs">
                <span className="rm-kicker">02 / Initial Access Vectors</span>
                <h3 className="font-semibold text-sm text-[#16232F] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-700" />
                  Top Predicted Attack Vectors
                </h3>
                <div className="space-y-2">
                  {prediction.topVectors.map((vec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] text-[#16232F] flex items-center gap-2.5"
                    >
                      <span className="w-5 h-5 rounded bg-[#0E2238] text-[#5FD3BF] font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium text-xs">{vec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attack Path Kill Chain */}
              <div className="bg-white border border-[#D9DDD3] rounded-xl p-5 text-xs shadow-xs">
                <span className="rm-kicker">03 / Adversary Progression</span>
                <h3 className="font-semibold text-sm text-[#16232F] mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0E2238]" />
                  Simulated MITRE ATT&amp;CK Kill Chain
                </h3>
                <div className="space-y-2">
                  {prediction.attackPath.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#081420] border border-[#3E6E86]/40 text-[#EEF3F1] font-mono text-[11px] leading-relaxed flex items-start gap-2"
                    >
                      <GitCommit className="w-4 h-4 text-[#5FD3BF] mt-0.5 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Mitigations */}
              <div className="p-4 rounded-xl bg-[#0D1C2D] border border-[#3E6E86]/50 text-xs">
                <h4 className="font-bold text-[#5FD3BF] font-mono mb-2 flex items-center gap-2 uppercase text-[11px]">
                  <ShieldCheck className="w-4 h-4" /> Prioritized Proactive Mitigations
                </h4>
                <ul className="space-y-1.5 text-[#C6D1D6]">
                  {prediction.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5FD3BF] mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
