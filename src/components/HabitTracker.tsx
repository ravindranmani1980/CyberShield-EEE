import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Flame,
  CheckCircle,
  Circle,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Activity,
  Award,
  KeyRound,
  Network,
  Code2,
  HardDrive,
  Radar,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HabitItem, ProductivitySession, EncryptedUserData } from '../types';

type HabitCategoryFilter =
  | 'all'
  | 'identity'
  | 'network'
  | 'code_audit'
  | 'health_opsec'
  | 'threat_intel';

interface SecurityDomainMeta {
  id: HabitCategoryFilter;
  label: string;
  shortLabel: string;
  tagline: string;
  badgeClass: string;
  icon: React.ReactNode;
}

const SECURITY_DOMAINS: SecurityDomainMeta[] = [
  {
    id: 'all',
    label: 'All Domains',
    shortLabel: 'All',
    tagline: 'Unified view across Identity, Network, Code, OpSec, and Threat Intel routines.',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: <Filter className="w-3.5 h-3.5" />,
  },
  {
    id: 'identity',
    label: 'Identity',
    shortLabel: 'Identity',
    tagline: 'Hardware passkeys (FIDO2), privileged SSO session hygiene, and zero-trust IAM.',
    badgeClass: 'bg-teal-50 text-teal-900 border-teal-200',
    icon: <KeyRound className="w-3.5 h-3.5" />,
  },
  {
    id: 'network',
    label: 'Network',
    shortLabel: 'Network',
    tagline: 'Perimeter egress auditing, DNS anomaly inspection, and honeypot telemetry.',
    badgeClass: 'bg-sky-50 text-sky-900 border-sky-200',
    icon: <Network className="w-3.5 h-3.5" />,
  },
  {
    id: 'code_audit',
    label: 'Code',
    shortLabel: 'Code',
    tagline: 'SBOM supply-chain scanning, dependency CVE auditing, and secure code review.',
    badgeClass: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    icon: <Code2 className="w-3.5 h-3.5" />,
  },
  {
    id: 'health_opsec',
    label: 'OpSec',
    shortLabel: 'OpSec',
    tagline: 'Air-gapped 3-2-1 cold backups, endpoint hardening, and operational discipline.',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
    icon: <HardDrive className="w-3.5 h-3.5" />,
  },
  {
    id: 'threat_intel',
    label: 'Threat Intel',
    shortLabel: 'Threat Intel',
    tagline: 'CISA KEV triage, active CVE advisories, and deep threat hunting workflows.',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    icon: <Radar className="w-3.5 h-3.5" />,
  },
];

interface HabitTrackerProps {
  userData: EncryptedUserData;
  onUpdateUserData: (data: EncryptedUserData) => void;
  onOpenVaultModal: () => void;
  isLocked: boolean;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  userData,
  onUpdateUserData,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Deep work threat hunting timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedSessionType, setSelectedSessionType] = useState<
    'threat_hunting' | 'incident_triage' | 'code_audit' | 'deep_work'
  >('threat_hunting');
  const [sessionNotes, setSessionNotes] = useState('');

  // New habit modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<
    'threat_intel' | 'identity' | 'code_audit' | 'network' | 'health_opsec'
  >('identity');
  const [newPriority, setNewPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');

  // Category filter
  const [filterCategory, setFilterCategory] = useState<HabitCategoryFilter>('all');

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
      } catch {
        // ignore
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Toggle habit completion for today
  const handleToggleHabit = (habitId: string) => {
    const updatedHabits = userData.habits.map((habit) => {
      if (habit.id !== habitId) return habit;
      const isCompletedToday = habit.completedDates.includes(today);

      let newCompletedDates: string[];
      let newStreak = habit.streak;

      if (isCompletedToday) {
        newCompletedDates = habit.completedDates.filter((d) => d !== today);
        newStreak = Math.max(0, newStreak - 1);
      } else {
        newCompletedDates = [...habit.completedDates, today];
        newStreak += 1;
        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#2BB5A0', '#5FD3BF', '#D79A45'],
          });
        } catch {
          // ignore
        }
      }

      return {
        ...habit,
        completedDates: newCompletedDates,
        streak: newStreak,
      };
    });

    onUpdateUserData({
      ...userData,
      habits: updatedHabits,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Save completed focus session
  const handleLogFocusSession = () => {
    const durationMins = Math.round((25 * 60 - timerSeconds) / 60);
    if (durationMins <= 0) return;

    const newSession: ProductivitySession = {
      id: `sess-${Date.now()}`,
      date: today,
      sessionType: selectedSessionType,
      durationMinutes: durationMins,
      notes: sessionNotes || 'Focused operational security session.',
    };

    onUpdateUserData({
      ...userData,
      productivitySessions: [newSession, ...(userData.productivitySessions || [])],
      lastUpdated: new Date().toISOString(),
    });

    setSessionNotes('');
    setTimerSeconds(25 * 60);
    setIsTimerRunning(false);

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  // Add new custom habit
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHabit: HabitItem = {
      id: `h-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom security operational routine.',
      category: newCategory,
      cadence: 'daily',
      priority: newPriority,
      completedDates: [],
      streak: 0,
    };

    onUpdateUserData({
      ...userData,
      habits: [...userData.habits, newHabit],
      lastUpdated: new Date().toISOString(),
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  // Resilience score metric
  const completedTodayCount = userData.habits.filter((h) =>
    h.completedDates.includes(today)
  ).length;
  const totalHabits = userData.habits.length || 1;
  const todayCompliancePct = Math.round((completedTodayCount / totalHabits) * 100);
  const totalFocusMinutes = (userData.productivitySessions || []).reduce(
    (acc, s) => acc + s.durationMinutes,
    0
  );
  const avgStreak = Math.round(
    userData.habits.reduce((acc, h) => acc + h.streak, 0) / totalHabits
  );
  const resilienceScore = Math.min(
    100,
    Math.round(todayCompliancePct * 0.5 + avgStreak * 4 + Math.min(25, totalFocusMinutes * 0.1))
  );

  const filteredHabits = userData.habits.filter((h) => {
    if (filterCategory === 'all') return true;
    return h.category === filterCategory;
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Postrix Command Panel with 4 Telemetry Metrics */}
      <section className="xh-panel">
        <div className="xh-kicker">
          <span className="k">Zero-Knowledge Operational Habit &amp; Posture Telemetry</span>
          <span className="tag">AES-GCM 256-Bit · Client-Side Encrypted</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          {/* Metric 1 */}
          <div className="xh-metric">
            <div className="lbl">
              <span>01 · Cyber Resilience</span>
              <Award className="w-3.5 h-3.5 text-[#5FD3BF]" />
            </div>
            <div className="num hi">
              {resilienceScore}
              <span className="text-xs font-normal text-[#A9B7BF] ml-1">/ 100</span>
            </div>
            <div className="mt-2.5 w-full h-1.5 bg-[#081420] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2BB5A0] transition-all duration-500"
                style={{ width: `${resilienceScore}%` }}
              />
            </div>
          </div>

          {/* Metric 2 with Radial Progress Bar */}
          <div className="xh-metric flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="lbl !mb-1.5">
                <span>02 · Daily Habits</span>
              </div>
              <div className="num">
                {completedTodayCount}
                <span className="text-xs font-normal text-[#A9B7BF] ml-1">
                  / {userData.habits.length} done
                </span>
              </div>
              <p>
                {todayCompliancePct === 100
                  ? 'All daily routines secured'
                  : `${userData.habits.length - completedTodayCount} remaining today`}
              </p>
            </div>

            {/* Radial Progress Bar */}
            <div
              className="relative w-16 h-16 shrink-0 flex items-center justify-center"
              role="progressbar"
              aria-valuenow={todayCompliancePct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Percentage of completed habits for today"
            >
              <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 64 64">
                <defs>
                  <linearGradient id="habitRadialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2BB5A0" />
                    <stop offset="100%" stopColor="#5FD3BF" />
                  </linearGradient>
                </defs>
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#081420"
                  strokeWidth="6"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="url(#habitRadialGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={
                    2 * Math.PI * 26 * (1 - Math.min(100, Math.max(0, todayCompliancePct)) / 100)
                  }
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-mono font-semibold text-[#5FD3BF] tabular-nums">
                {todayCompliancePct}%
              </span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="xh-metric">
            <div className="lbl">
              <span>03 · Discipline Streak</span>
              <Flame className="w-3.5 h-3.5 text-[#EBC385]" />
            </div>
            <div className="num">
              {avgStreak}
              <span className="text-xs font-normal text-[#A9B7BF] ml-1.5">days avg</span>
            </div>
            <p>Unbroken operational cadence</p>
          </div>

          {/* Metric 4 */}
          <div className="xh-metric">
            <div className="lbl">
              <span>04 · Threat Hunting</span>
              <Clock className="w-3.5 h-3.5 text-[#5FD3BF]" />
            </div>
            <div className="num hi">
              {totalFocusMinutes}
              <span className="text-xs font-normal text-[#A9B7BF] ml-1.5">min logged</span>
            </div>
            <p>{userData.productivitySessions?.length || 0} encrypted focus sessions</p>
          </div>
        </div>
      </section>

      {/* Main Grid: Habits List on Left (2 cols), Threat Hunting Timer on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habits Column (2 spans) — Crisp Postrix Paper Card */}
        <section className="lg:col-span-2 bg-white border border-[#D9DDD3] rounded-xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0E2238] text-[#5FD3BF] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="rm-kicker">01 / Zero-Knowledge Daily Defense Checklist</span>
                <h2 className="text-lg font-semibold text-[#16232F]">
                  Operational Security Routines
                </h2>
                <p className="text-xs text-[#4B5A66] mt-0.5">
                  Encrypted locally with AES-GCM 256-bit. Click any control to toggle daily completion.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (filterCategory !== 'all') {
                  setNewCategory(filterCategory);
                }
                setShowAddModal(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#0E2238] hover:bg-[#16232F] text-[#F3F5F1] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#5FD3BF]" />
              <span>New Routine</span>
            </button>
          </div>

          {/* Domain Category Filtering System */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#4B5A66] font-semibold">
                Filter by Security Training Domain
              </span>
              {filterCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFilterCategory('all')}
                  className="text-[11px] font-mono text-[#0E2238] hover:text-[#D79A45] underline underline-offset-4 cursor-pointer"
                >
                  Reset to All Domains ({userData.habits.length})
                </button>
              )}
            </div>

            <div
              role="tablist"
              aria-label="Habit security domain filter"
              className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2"
            >
              {SECURITY_DOMAINS.map((domain) => {
                const domainHabits =
                  domain.id === 'all'
                    ? userData.habits
                    : userData.habits.filter((h) => h.category === domain.id);
                const domainCompleted = domainHabits.filter((h) =>
                  h.completedDates.includes(today)
                ).length;
                const isSelected = filterCategory === domain.id;

                return (
                  <button
                    key={domain.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setFilterCategory(domain.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-[#0E2238] text-[#EEF3F1] border-[#0E2238] shadow-sm'
                        : 'bg-[#F3F5F1] text-[#16232F] border-[#D9DDD3] hover:border-[#0E2238]/40 hover:bg-[#E9ECE6]/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`${
                          isSelected ? 'text-[#5FD3BF]' : 'text-[#0E2238]'
                        }`}
                      >
                        {domain.icon}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold tabular-nums ${
                          isSelected
                            ? 'bg-[#102236] text-[#5FD3BF] border border-[#5FD3BF]/30'
                            : 'bg-white text-[#4B5A66] border border-[#D9DDD3]'
                        }`}
                      >
                        {domainCompleted}/{domainHabits.length}
                      </span>
                    </div>
                    <div className="font-mono text-xs font-semibold truncate">
                      {domain.label}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Domain Focus Summary Bar */}
            {(() => {
              const activeDomain =
                SECURITY_DOMAINS.find((d) => d.id === filterCategory) || SECURITY_DOMAINS[0];
              const domainTotal = filteredHabits.length;
              const domainDone = filteredHabits.filter((h) =>
                h.completedDates.includes(today)
              ).length;
              const domainPct =
                domainTotal > 0 ? Math.round((domainDone / domainTotal) * 100) : 0;

              return (
                <div className="p-3 rounded-xl bg-[#0D1C2D] text-[#EEF3F1] border border-[#3E6E86]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#102236] border border-[#5FD3BF]/30 text-[#5FD3BF] flex items-center justify-center shrink-0">
                      {activeDomain.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[#5FD3BF]">
                          {activeDomain.label} Domain Focus
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#102236] text-[#EBC385] border border-[#3E6E86]/40">
                          {domainDone}/{domainTotal} Completed ({domainPct}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A9B7BF] mt-0.5">
                        {activeDomain.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-32 shrink-0">
                    <div className="w-full h-1.5 bg-[#081420] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2BB5A0] transition-all duration-300"
                        style={{ width: `${domainPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Habit Cards */}
          <div className="space-y-2.5">
            {filteredHabits.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#F3F5F1] border border-dashed border-[#C7CDC0] text-center space-y-2">
                <p className="text-sm font-semibold text-[#16232F]">
                  No routines found in the{' '}
                  {SECURITY_DOMAINS.find((d) => d.id === filterCategory)?.label || filterCategory}{' '}
                  domain.
                </p>
                <p className="text-xs text-[#4B5A66]">
                  Add a custom security routine to this domain or switch back to All Domains.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (filterCategory !== 'all') {
                        setNewCategory(filterCategory);
                      }
                      setShowAddModal(true);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#0E2238] text-[#F3F5F1] text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#5FD3BF]" />
                    <span>Add Routine to Domain</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterCategory('all')}
                    className="px-3.5 py-2 rounded-lg bg-white text-[#16232F] border border-[#C7CDC0] text-xs font-medium cursor-pointer"
                  >
                    Show All Domains
                  </button>
                </div>
              </div>
            ) : (
              filteredHabits.map((habit) => {
                const isDone = habit.completedDates.includes(today);
                const domainMeta =
                  SECURITY_DOMAINS.find((d) => d.id === habit.category) || SECURITY_DOMAINS[1];
                return (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 select-none ${
                      isDone
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-[#F3F5F1]/60 hover:bg-[#F3F5F1] border-[#D9DDD3] hover:border-[#C7CDC0]'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        type="button"
                        className="mt-0.5 text-[#4B5A66] group-hover:text-[#16232F] transition shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle className="w-5 h-5 text-emerald-700 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold ${
                              isDone ? 'line-through text-[#4B5A66]' : 'text-[#16232F]'
                            }`}
                          >
                            {habit.title}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold inline-flex items-center gap-1 ${domainMeta.badgeClass}`}
                          >
                            {domainMeta.shortLabel}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border font-semibold ${
                              habit.priority === 'CRITICAL'
                                ? 'bg-red-50 text-red-800 border-red-200'
                                : habit.priority === 'HIGH'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {habit.priority}
                          </span>
                        </div>
                        <p className="text-xs text-[#4B5A66] mt-1 leading-relaxed">
                          {habit.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs text-[#D79A45] font-semibold shrink-0 tabular-nums">
                      <Flame className="w-4 h-4 fill-[#D79A45]/20" />
                      <span>{habit.streak}d</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: Deep Work / Threat Hunting Pomodoro Timer */}
        <div className="space-y-4">
          <div className="bg-white border border-[#D9DDD3] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="rm-kicker">02 / Focus Telemetry</span>
                <h3 className="text-sm font-semibold text-[#16232F] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#0E2238]" /> Threat Hunting Focus Block
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                E2EE Notes
              </span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '25m Sprint', secs: 25 * 60 },
                { label: '50m Deep', secs: 50 * 60 },
                { label: '90m Audit', secs: 90 * 60 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  disabled={isTimerRunning}
                  onClick={() => setTimerSeconds(p.secs)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition cursor-pointer ${
                    timerSeconds === p.secs
                      ? 'bg-[#0E2238] text-[#5FD3BF] border-[#0E2238] font-medium'
                      : 'bg-[#F3F5F1] text-[#4B5A66] border-[#D9DDD3] hover:text-[#16232F]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Dark Instrument Timer Display */}
            <div className="text-center py-6 bg-[#081420] rounded-xl border border-[#3E6E86]/40">
              <div className="text-5xl font-mono font-semibold tracking-tight text-[#EEF3F1] tabular-nums">
                {formatTime(timerSeconds)}
              </div>
              <p className="text-xs text-[#5FD3BF] mt-2 capitalize font-mono">
                Mode: {selectedSessionType.replace('_', ' ')}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  isTimerRunning
                    ? 'bg-[#D79A45] hover:bg-[#EBC385] text-[#081420]'
                    : 'bg-[#0E2238] hover:bg-[#16232F] text-[#F3F5F1]'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Session
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Start Threat Hunt
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(25 * 60);
                }}
                className="p-2.5 rounded-lg bg-[#F3F5F1] hover:bg-[#E9ECE6] text-[#16232F] border border-[#D9DDD3] transition cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Session Type Select & Encrypted Notes */}
            <div className="space-y-2.5 pt-3 border-t border-slate-200 text-xs">
              <label className="text-[#4B5A66] font-medium block">Session Category:</label>
              <select
                value={selectedSessionType}
                onChange={(e: any) => setSelectedSessionType(e.target.value)}
                className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg px-3 py-2 text-[#16232F] outline-none focus:border-[#0E2238]"
              >
                <option value="threat_hunting">Threat Hunting &amp; Log Correlation</option>
                <option value="incident_triage">Incident Response &amp; Triage</option>
                <option value="code_audit">Security Code Review &amp; Pentest</option>
                <option value="deep_work">Reverse Engineering &amp; Deep Work</option>
              </select>

              <label className="text-[#4B5A66] font-medium block mt-2">
                Encrypted Session Reflection (Zero-Knowledge):
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Log IOCs, investigated alerts, or hardening steps (encrypted with master key)..."
                rows={3}
                className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg p-2.5 text-xs text-[#16232F] placeholder-[#7F909A] outline-none focus:border-[#0E2238] resize-none"
              />

              <button
                type="button"
                onClick={handleLogFocusSession}
                className="w-full py-2 rounded-lg bg-[#2BB5A0] hover:bg-[#5FD3BF] text-[#04211B] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Commit Encrypted Session Log
              </button>
            </div>
          </div>

          {/* Recent Encrypted Sessions */}
          <div className="bg-white border border-[#D9DDD3] rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4B5A66] mb-3 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#0E2238]" /> Recent Encrypted Logs
            </h3>
            <div className="space-y-2 text-xs">
              {(userData.productivitySessions || []).slice(0, 3).map((sess) => (
                <div
                  key={sess.id}
                  className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] space-y-1"
                >
                  <div className="flex items-center justify-between text-[#4B5A66] text-[11px] font-mono">
                    <span className="capitalize font-semibold text-[#0E2238]">
                      {sess.sessionType.replace('_', ' ')}
                    </span>
                    <span>
                      {sess.durationMinutes} min · {sess.date}
                    </span>
                  </div>
                  <p className="text-[#16232F] text-xs leading-relaxed italic">
                    &ldquo;{sess.notes}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081420]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-[#C7CDC0] rounded-xl p-6 text-[#16232F] shadow-2xl">
            <span className="rm-kicker">New Zero-Knowledge Control</span>
            <h3 className="text-base font-bold text-[#16232F] mb-1">
              Add Defensive Habit / Routine
            </h3>
            <p className="text-xs text-[#4B5A66] mb-4">
              Stored exclusively in client-side AES-GCM 256-bit ciphertext.
            </p>

            <form onSubmit={handleAddHabit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#16232F] font-medium mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Invalidate Stale AWS CLI Tokens"
                  className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg px-3 py-2 text-[#16232F] outline-none focus:border-[#0E2238]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[#16232F] font-medium mb-1">
                  Description / Verification Steps
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Run aws sts get-caller-identity and clear session cache..."
                  rows={2}
                  className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg p-2.5 text-[#16232F] outline-none focus:border-[#0E2238] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#16232F] font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg px-2.5 py-2 text-[#16232F] outline-none focus:border-[#0E2238]"
                  >
                    <option value="identity">Identity &amp; Access</option>
                    <option value="threat_intel">Threat Intel</option>
                    <option value="code_audit">Code &amp; Dependency</option>
                    <option value="network">Network &amp; Egress</option>
                    <option value="health_opsec">OpSec &amp; Backups</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#16232F] font-medium mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full bg-[#F3F5F1] border border-[#C7CDC0] rounded-lg px-2.5 py-2 text-[#16232F] outline-none focus:border-[#0E2238]"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-[#F3F5F1] hover:bg-[#E9ECE6] text-[#16232F] border border-[#C7CDC0] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0E2238] hover:bg-[#16232F] text-[#F3F5F1] font-medium cursor-pointer"
                >
                  Save Encrypted Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
