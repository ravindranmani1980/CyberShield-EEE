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
  Lock,
  Calendar,
  Sparkles,
  Tag,
  Activity,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HabitItem, ProductivitySession, EncryptedUserData } from '../types';

interface HabitTrackerProps {
  userData: EncryptedUserData;
  onUpdateUserData: (data: EncryptedUserData) => void;
  onOpenVaultModal: () => void;
  isLocked: boolean;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  userData,
  onUpdateUserData,
  onOpenVaultModal,
  isLocked,
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
  const [filterCategory, setFilterCategory] = useState<string>('all');

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
            colors: ['#10b981', '#06b6d4', '#6366f1'],
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
      {/* Top Banner / Metrics HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Cyber Resilience
            </span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{resilienceScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${resilienceScore}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Daily Defense Habits
            </span>
            <CheckCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {completedTodayCount}
            </span>
            <span className="text-xs text-slate-400">/ {userData.habits.length} done</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">
            {todayCompliancePct}% completed today
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Discipline Streak
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{avgStreak}</span>
            <span className="text-xs text-slate-400">days avg</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-400 font-mono">
            Unbroken operational cadence
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Deep Threat Hunting
            </span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalFocusMinutes}</span>
            <span className="text-xs text-slate-400">min logged</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">
            {userData.productivitySessions?.length || 0} secure sessions
          </p>
        </div>
      </div>

      {/* Main Grid: Habits List on Left (2 cols), Threat Hunting Timer on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habits Column (2 spans) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Operational Security Routines
              </h2>
              <p className="text-xs text-slate-400">
                Encrypted with AES-GCM 256. Click to toggle daily completion.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> New Routine
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['all', 'identity', 'threat_intel', 'code_audit', 'network', 'health_opsec'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg capitalize whitespace-nowrap transition border ${
                    filterCategory === cat
                      ? 'bg-slate-800 text-emerald-400 border-emerald-500/40 font-medium'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {cat === 'all'
                    ? 'All Routines'
                    : cat.replace('_', ' ')}
                </button>
              )
            )}
          </div>

          {/* Habit Cards */}
          <div className="space-y-2.5">
            {filteredHabits.map((habit) => {
              const isDone = habit.completedDates.includes(today);
              return (
                <div
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 select-none ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      className="mt-0.5 text-slate-500 group-hover:text-slate-300 transition shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-100'
                          }`}
                        >
                          {habit.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase border ${
                            habit.priority === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : habit.priority === 'HIGH'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {habit.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {habit.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400 shrink-0">
                    <Flame className="w-4 h-4 fill-amber-400/20" />
                    <span>{habit.streak}d</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Work / Threat Hunting Pomodoro Timer */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Threat Hunting Focus Block
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                E2EE Notes
              </span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: '25m Sprint', secs: 25 * 60 },
                { label: '50m Deep', secs: 50 * 60 },
                { label: '90m Audit', secs: 90 * 60 },
              ].map((p) => (
                <button
                  key={p.label}
                  disabled={isTimerRunning}
                  onClick={() => setTimerSeconds(p.secs)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-mono border transition ${
                    timerSeconds === p.secs
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="text-center py-6 bg-slate-950/70 rounded-2xl border border-slate-800/80 mb-4">
              <div className="text-5xl font-mono font-bold tracking-tight text-white drop-shadow">
                {formatTime(timerSeconds)}
              </div>
              <p className="text-xs text-slate-400 mt-2 capitalize font-mono">
                Mode: {selectedSessionType.replace('_', ' ')}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Session
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Start Threat Hunt
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(25 * 60);
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Session Type Select & Encrypted Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <label className="text-slate-400 font-medium block">Session Category:</label>
              <select
                value={selectedSessionType}
                onChange={(e: any) => setSelectedSessionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="threat_hunting">Threat Hunting & Log Correlation</option>
                <option value="incident_triage">Incident Response & Triage</option>
                <option value="code_audit">Security Code Review & Pentest</option>
                <option value="deep_work">Reverse Engineering & Deep Work</option>
              </select>

              <label className="text-slate-400 font-medium block mt-2">
                Encrypted Session Reflection (Zero-Knowledge):
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Log IOCs, investigated alerts, or hardening steps (encrypted with master key)..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500 resize-none"
              />

              <button
                onClick={handleLogFocusSession}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Commit Encrypted Session Log
              </button>
            </div>
          </div>

          {/* Recent Encrypted Sessions */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Recent Encrypted Logs
            </h3>
            <div className="space-y-2 text-xs">
              {(userData.productivitySessions || []).slice(0, 3).map((sess) => (
                <div
                  key={sess.id}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                    <span className="capitalize text-indigo-300">
                      {sess.sessionType.replace('_', ' ')}
                    </span>
                    <span>{sess.durationMinutes} min &bull; {sess.date}</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed italic">
                    "{sess.notes}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Add Defensive Habit / Routine
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Stored exclusively in client-side AES-GCM 256-bit ciphertext.
            </p>

            <form onSubmit={handleAddHabit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Invalidate Stale AWS CLI Tokens"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Description / Verification Steps
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Run aws sts get-caller-identity and clear session cache..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 outline-none focus:border-emerald-500"
                  >
                    <option value="identity">Identity & Access</option>
                    <option value="threat_intel">Threat Intel</option>
                    <option value="code_audit">Code & Dependency</option>
                    <option value="network">Network & Egress</option>
                    <option value="health_opsec">OpSec & Backups</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 outline-none focus:border-emerald-500"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-950"
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
