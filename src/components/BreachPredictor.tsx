import React, { useState } from 'react';
import {
  BrainCircuit,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Cpu,
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

  const [prediction, setPrediction] = useState<BreachPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Initial calculation / run prediction with client fallback
  const handleRunPrediction = async () => {
    setLoading(true);
    let resolvedData: BreachPredictionResult | null = null;

    try {
      const resp = await fetch('/api/predict-breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telemetry }),
      });

      if (resp.ok) {
        const text = await resp.text();
        try {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object' && typeof parsed.probability === 'number') {
            resolvedData = {
              ...parsed,
              executiveSummary: parsed.executiveSummary || parsed.summary || '',
            };
          }
        } catch (jsonErr) {
          console.warn('Invalid JSON from /api/predict-breach, falling back to local computation:', jsonErr);
        }
      } else {
        console.warn(`/api/predict-breach returned status ${resp.status}, falling back to local computation`);
      }
    } catch (networkErr) {
      console.warn('Network error calling /api/predict-breach, falling back to local computation:', networkErr);
    }

    // Fallback if request failed, returned non-OK status, or returned invalid JSON
    if (!resolvedData) {
      resolvedData = calculateHeuristicBreachProbability(telemetry);
    }

    setPrediction(resolvedData);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Quick preset configurations
  const applyPreset = (type: 'current' | 'hardened' | 'vulnerable') => {
    if (type === 'hardened') {
      setTelemetry({
        mfaCoverage: 100,
        unpatchedCves: 0,
        phishingFailureRate: 3,
        edrCoverage: 99,
        exposedServices: 0,
        habitAdherence: 96,
        darkWebMentions: 0,
        anomalousLogins: 0,
      });
    } else if (type === 'vulnerable') {
      setTelemetry({
        mfaCoverage: 45,
        unpatchedCves: 9,
        phishingFailureRate: 32,
        edrCoverage: 60,
        exposedServices: 6,
        habitAdherence: 40,
        darkWebMentions: 8,
        anomalousLogins: 12,
      });
    } else {
      setTelemetry({
        mfaCoverage: 78,
        unpatchedCves: 3,
        phishingFailureRate: 14,
        edrCoverage: 88,
        exposedServices: 2,
        habitAdherence: 82,
        darkWebMentions: 3,
        anomalousLogins: 4,
      });
    }
  };

  const getRiskTheme = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-950/70 border-rose-500/50 text-rose-300';
      case 'HIGH':
        return 'bg-amber-950/70 border-amber-500/50 text-amber-300';
      case 'MEDIUM':
        return 'bg-yellow-950/70 border-yellow-500/50 text-yellow-300';
      default:
        return 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            Machine Learning Breach Prediction & Forecasting Engine
          </h2>
          <p className="text-xs text-slate-400">
            Synthesizes operational security telemetry to forecast probabilistic breach likelihoods before initial access occurs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Presets */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-mono text-[11px] mr-1">Simulate Posture:</span>
            <button
              onClick={() => applyPreset('vulnerable')}
              className="px-2.5 py-1 rounded-lg bg-slate-950 text-rose-400 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono transition"
            >
              Degraded
            </button>
            <button
              onClick={() => applyPreset('current')}
              className="px-2.5 py-1 rounded-lg bg-slate-950 text-amber-400 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono transition"
            >
              Typical
            </button>
            <button
              onClick={() => applyPreset('hardened')}
              className="px-2.5 py-1 rounded-lg bg-slate-950 text-emerald-400 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono transition"
            >
              Hardened (Zero-Trust)
            </button>
          </div>

          <button
            onClick={handleRunPrediction}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-950 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-200" />
            )}
            Forecast Breach Probability
          </button>
        </div>
      </div>

      {/* Main Grid: Telemetry Sliders on Left, ML Prediction Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Telemetry Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-300 font-mono uppercase text-xs flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Operational Posture Telemetry
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Live Weights</span>
            </div>

            {/* Slider 1: MFA */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>MFA / Passkey Coverage</span>
                <span className="font-mono text-cyan-400 font-semibold">{telemetry.mfaCoverage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={telemetry.mfaCoverage}
                onChange={(e) => setTelemetry({ ...telemetry, mfaCoverage: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Slider 2: CVEs */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Unpatched Critical / High CVEs</span>
                <span className="font-mono text-rose-400 font-semibold">{telemetry.unpatchedCves}</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                value={telemetry.unpatchedCves}
                onChange={(e) => setTelemetry({ ...telemetry, unpatchedCves: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Slider 3: Phishing Failure Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Simulated Phishing Failure Rate</span>
                <span className="font-mono text-amber-400 font-semibold">{telemetry.phishingFailureRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={telemetry.phishingFailureRate}
                onChange={(e) => setTelemetry({ ...telemetry, phishingFailureRate: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Slider 4: EDR Coverage */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>EDR Endpoint Agent Coverage</span>
                <span className="font-mono text-emerald-400 font-semibold">{telemetry.edrCoverage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={telemetry.edrCoverage}
                onChange={(e) => setTelemetry({ ...telemetry, edrCoverage: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Slider 5: Exposed Services */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Public Exposed Services / Shadow IT</span>
                <span className="font-mono text-rose-400 font-semibold">{telemetry.exposedServices}</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={telemetry.exposedServices}
                onChange={(e) => setTelemetry({ ...telemetry, exposedServices: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Slider 6: Habit Adherence */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Security Routine Habit Adherence</span>
                <span className="font-mono text-indigo-400 font-semibold">{telemetry.habitAdherence}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={telemetry.habitAdherence}
                onChange={(e) => setTelemetry({ ...telemetry, habitAdherence: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Slider 7: Dark Web Mentions */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Dark Web Leaked Credential Mentions</span>
                <span className="font-mono text-amber-400 font-semibold">{telemetry.darkWebMentions}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={telemetry.darkWebMentions}
                onChange={(e) => setTelemetry({ ...telemetry, darkWebMentions: Number(e.target.value) })}
                className="w-full accent-amber-500"
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
                className={`p-5 rounded-2xl border shadow-xl transition-all ${getRiskTheme(
                  prediction.riskLevel
                )}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider block">
                      90-Day Predicted Breach Likelihood
                    </span>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="text-4xl font-black tracking-tight text-white">
                        {prediction.probability}%
                      </span>
                      <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-black/40 border border-white/20">
                        {prediction.riskLevel} RISK TIER
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/30">
                    <Activity className="w-8 h-8" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        prediction.probability > 70
                          ? 'bg-rose-500'
                          : prediction.probability > 45
                          ? 'bg-amber-500'
                          : prediction.probability > 25
                          ? 'bg-yellow-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${prediction.probability}%` }}
                    />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-200 leading-relaxed font-sans">
                  {prediction.executiveSummary}
                </p>
              </div>

              {/* Top 3 Predicted Vectors */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  Top Predicted Attack Vectors
                </h3>
                <div className="space-y-1.5">
                  {prediction.topVectors.map((vec, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium text-xs">{vec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attack Path Kill Chain */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-400 font-mono mb-2.5 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Simulated MITRE ATT&CK Kill Chain
                </h3>
                <div className="space-y-2">
                  {prediction.attackPath.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 font-mono text-[11px] leading-relaxed flex items-start gap-2"
                    >
                      <GitCommit className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Mitigations */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs">
                <h4 className="font-bold text-indigo-300 font-mono mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Prioritized Proactive Mitigations
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {prediction.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-400 text-xs space-y-3">
              <BrainCircuit className="w-10 h-10 mx-auto text-indigo-500" />
              <div>
                <p className="font-medium text-white">No Forecast Generated Yet</p>
                <p className="text-slate-500 text-xs mt-1">
                  Adjust operational telemetry inputs on the left and click <strong>Forecast Breach Probability</strong> to execute the machine learning prediction model.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
