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
        return 'bg-red-950/60 text-red-300 border-red-400/40';
      case 'HIGH':
        return 'bg-[#D79A45]/20 text-[#EBC385] border-[#D79A45]/40';
      default:
        return 'bg-[#2BB5A0]/20 text-[#5FD3BF] border-[#5FD3BF]/40';
    }
  };

  return (
    <section className="xh-panel">
      {/* Kicker Bar */}
      <div className="xh-kicker">
        <span className="k flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-[#5FD3BF]" />
          Daily Security Briefing · Actionable Cyber Defense Practice
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="tag flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {isDailyDefault ? `Featured: ${todayStr}` : 'Randomized Briefing'}
          </span>
          <span className="tag">{tip.category}</span>
          <span
            className={`px-2 py-0.5 rounded border font-mono text-[11px] font-semibold uppercase ${getImpactBadgeStyle(
              tip.impactLevel
            )}`}
          >
            {tip.impactLevel} IMPACT
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 pt-4">
        <div className="space-y-3 flex-1">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-semibold text-[#EEF3F1] tracking-tight">
                {tip.title}
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-mono text-[#A9B7BF]">
                <BookOpen className="w-3.5 h-3.5 text-[#5FD3BF]" />
                {tip.frameworkRef}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#C6D1D6] leading-relaxed">
              {tip.summary}
            </p>
          </div>

          {/* Actionable Step Callout */}
          <div className="p-3.5 rounded-lg bg-[#102236] border border-[#3E6E86]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Terminal className="w-4 h-4 text-[#5FD3BF] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-mono uppercase text-[11px] font-semibold text-[#5FD3BF] block mb-0.5">
                  Actionable Best Practice:
                </span>
                <span className="text-[#EEF3F1]">{tip.actionableStep}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={handleCopyAction}
                className="xh-btn !py-1.5 !px-2.5 !text-xs"
                title="Copy security tip to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#5FD3BF]" />
                    <span className="text-[#5FD3BF]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#A9B7BF]" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {isVaultUnlocked && onAddTipAsHabit && (
                <button
                  type="button"
                  onClick={handleAddHabitClick}
                  disabled={addedToHabits}
                  className={`xh-btn !py-1.5 !px-3 !text-xs ${
                    addedToHabits ? '' : 'primary'
                  }`}
                >
                  {addedToHabits ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#5FD3BF]" />
                      <span className="text-[#5FD3BF]">Added to Routines</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
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
            type="button"
            onClick={handleRandomizeTip}
            disabled={isRefreshing}
            className="xh-btn primary"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>Randomize Tip</span>
          </button>

          {!isDailyDefault && (
            <button
              type="button"
              onClick={handleResetToDaily}
              className="text-xs font-mono text-[#A9B7BF] hover:text-[#5FD3BF] underline underline-offset-4 transition-colors cursor-pointer"
            >
              Reset to Today&apos;s Tip
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
