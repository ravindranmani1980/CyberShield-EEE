import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  RefreshCw,
  ShieldCheck,
  Copy,
  Check,
  PlusCircle,
  Terminal,
  BookOpen,
  Calendar,
} from 'lucide-react';
import {
  SecurityTip,
  getDailySecurityTip,
  getRandomSecurityTip,
} from '../data/securityTipsData';

interface DailySecurityTipProps {
  onAddTipAsHabit?: (tip: SecurityTip) => void;
  isVaultUnlocked?: boolean;
}

export const DailySecurityTip: React.FC<DailySecurityTipProps> = ({
  onAddTipAsHabit,
  isVaultUnlocked = false,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [tip, setTip] = useState<SecurityTip>(() => getDailySecurityTip(todayStr));
  const [isDailyDefault, setIsDailyDefault] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addedToHabits, setAddedToHabits] = useState(false);

  // Sync with today's date on mount
  useEffect(() => {
    setTip(getDailySecurityTip(todayStr));
    setIsDailyDefault(true);
  }, [todayStr]);

  // Fetch a randomized actionable security tip
  const handleRandomizeTip = () => {
    setIsRefreshing(true);
    setAddedToHabits(false);
    setCopied(false);

    setTimeout(() => {
      const nextTip = getRandomSecurityTip(tip.id);
      setTip(nextTip);
      setIsDailyDefault(false);
      setIsRefreshing(false);
    }, 180);
  };

  // Reset back to today's featured tip
  const handleResetToDaily = () => {
    setAddedToHabits(false);
    setCopied(false);
    setTip(getDailySecurityTip(todayStr));
    setIsDailyDefault(true);
  };

  const handleCopyAction = async () => {
    try {
      await navigator.clipboard.writeText(
        `${tip.title}\nAction: ${tip.actionableStep}\nReference: ${tip.frameworkRef}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignore
    }
  };

  const handleAddHabitClick = () => {
    if (!onAddTipAsHabit) return;
    onAddTipAsHabit(tip);
    setAddedToHabits(true);
  };

  const getImpactBadgeStyle = (level: SecurityTip['impactLevel']) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-indigo-950/30 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Subtle top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        {/* Left & Center Content */}
        <div className="space-y-3 flex-1">
          {/* Header Meta Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-semibold">
              <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
              DAILY SECURITY TIP
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[11px]">
              <Calendar className="w-3 h-3 text-slate-500" />
              {isDailyDefault ? `Featured: ${todayStr}` : 'Randomized Briefing'}
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-[11px]">
              {tip.category}
            </span>

            <span
              className={`px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold uppercase ${getImpactBadgeStyle(
                tip.impactLevel
              )}`}
            >
              {tip.impactLevel} IMPACT
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 ml-auto lg:ml-0">
              <BookOpen className="w-3 h-3 text-slate-500" />
              {tip.frameworkRef}
            </span>
          </div>

          {/* Title & Threat Context */}
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {tip.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {tip.summary}
            </p>
          </div>

          {/* Actionable Best Practice Callout */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-mono uppercase text-[10px] font-bold text-emerald-400 block mb-0.5">
                  Actionable Best Practice:
                </span>
                <span className="text-slate-200">{tip.actionableStep}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={handleCopyAction}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono flex items-center gap-1.5 transition"
                title="Copy security tip to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {isVaultUnlocked && onAddTipAsHabit && (
                <button
                  onClick={handleAddHabitClick}
                  disabled={addedToHabits}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono flex items-center gap-1.5 border transition ${
                    addedToHabits
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 cursor-default'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {addedToHabits ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Added to Routines</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Add to Routines</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex sm:flex-row lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0">
          <button
            onClick={handleRandomizeTip}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-medium flex items-center gap-2 transition shadow-sm"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-cyan-400 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span>Randomize Tip</span>
          </button>

          {!isDailyDefault && (
            <button
              onClick={handleResetToDaily}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-400 hover:text-slate-200 transition"
            >
              Reset to Today&apos;s Tip
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
