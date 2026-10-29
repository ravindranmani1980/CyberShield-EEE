import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  ShieldAlert,
  ShieldCheck,
  Flame,
  Trophy,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  AlertOctagon,
  PhoneCall,
  Mail,
  Link as LinkIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GAME_CARDS, GameCard } from '../data/trainingGameData';

export const CyberTrainingGame: React.FC = () => {
  // Game State: 'start' | 'playing' | 'round_review' | 'game_over'
  const [gameState, setGameState] = useState<'start' | 'playing' | 'round_review' | 'game_over'>('start');
  const [cards, setCards] = useState<GameCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('cybershield_game_highscore')) || 0;
  });

  // Timer per question (10 seconds)
  const [timeLeft, setTimeLeft] = useState(10);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [lastCardReviewed, setLastCardReviewed] = useState<GameCard | null>(null);

  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // Shuffle & Start Game
  const handleStartGame = () => {
    const shuffled = [...GAME_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setTotalAnswered(0);
    setTimeLeft(10);
    setLastAnswerCorrect(null);
    setLastCardReviewed(null);
    setGameState('playing');
  };

  // Timer countdown hook
  useEffect(() => {
    let timer: any = null;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleAnswer(null);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Handle user decision: userSelectedThreat (true = Threat, false = Legit, null = Timeout)
  const handleAnswer = (userSelectedThreat: boolean | null) => {
    const currentCard = cards[currentIndex];
    const isCorrect = userSelectedThreat !== null && userSelectedThreat === currentCard.isThreat;

    setTotalAnswered((prev) => prev + 1);
    setLastCardReviewed(currentCard);
    setLastAnswerCorrect(isCorrect);

    if (isCorrect) {
      const timeBonus = Math.round(timeLeft * 10);
      const comboMultiplier = streak >= 4 ? 2 : streak >= 2 ? 1.5 : 1;
      const pointsWon = Math.round((100 + timeBonus) * comboMultiplier);

      const newScore = score + pointsWon;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('cybershield_game_highscore', newScore.toString());
      }

      if (newStreak % 3 === 0) {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch {
          // ignore
        }
      }
    } else {
      setStreak(0);
    }

    setGameState('round_review');
  };

  // Move to next card
  const handleNextCard = () => {
    if (currentIndex + 1 < cards.length && currentIndex + 1 < 10) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(10);
      setGameState('playing');
    } else {
      setGameState('game_over');
      if (score >= 1000) {
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
      }
    }
  };

  // Rank title calculator
  const getRank = (scoreVal: number) => {
    if (scoreVal >= 1600) return { title: 'Legendary CISO Guardian', color: 'text-emerald-700' };
    if (scoreVal >= 1200) return { title: 'Lead Threat Hunter', color: 'text-[#0E2238]' };
    if (scoreVal >= 800) return { title: 'SOC Incident Responder', color: 'text-[#3E6E86]' };
    if (scoreVal >= 400) return { title: 'Security Analyst Tier 1', color: 'text-[#D79A45]' };
    return { title: 'Security Apprentice', color: 'text-[#4B5A66]' };
  };

  const currentCard = cards[currentIndex] || GAME_CARDS[0];
  const rank = getRank(score);

  return (
    <div className="space-y-6">
      {/* Postrix Command Header and Score HUD */}
      <section className="xh-panel">
        <div className="xh-kicker">
          <span className="k">Rapid Incident Classification &amp; SOC Triage Drill</span>
          <span className="tag">10-Second Tactical Evaluation</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="rm-mono-mark !w-10 !h-10">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#EEF3F1] flex items-center gap-2">
                Cyber Threat Blitz: Speed Triage Game
              </h2>
              <p className="text-xs text-[#A9B7BF]">
                Test your instincts in 10 seconds: distinguish real security alerts from phishing, vishing, and OTP theft.
              </p>
            </div>
          </div>

          {/* Live Score & Streak Display */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="xh-metric !py-2 !px-3.5 text-right">
              <span className="text-[10px] font-mono text-[#A9B7BF] block uppercase">
                Current Score
              </span>
              <span className="text-base font-mono font-semibold text-[#EBC385] tabular-nums">
                {score} pts
              </span>
            </div>

            <div className="xh-metric !py-2 !px-3.5 text-right">
              <span className="text-[10px] font-mono text-[#A9B7BF] block uppercase">
                Combo Streak
              </span>
              <span className="text-base font-mono font-semibold text-[#5FD3BF] flex items-center justify-end gap-1 tabular-nums">
                <Flame className="w-3.5 h-3.5 text-[#EBC385]" /> {streak}x
              </span>
            </div>

            <div className="xh-metric !py-2 !px-3.5 text-right">
              <span className="text-[10px] font-mono text-[#A9B7BF] block uppercase">
                Best Record
              </span>
              <span className="text-base font-mono font-semibold text-[#EEF3F1] tabular-nums">
                {highScore} pts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* GAME SCREEN */}
      {gameState === 'start' && (
        <div className="max-w-2xl mx-auto p-8 rounded-xl bg-white border border-[#D9DDD3] text-center space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-xl bg-[#0E2238] text-[#5FD3BF] mx-auto flex items-center justify-center shadow-md">
            <Zap className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="rm-kicker">Interactive SOC Readiness Drill</span>
            <h3 className="text-xl font-bold text-[#16232F] tracking-tight font-serif">
              Ready for the Threat Triage Speed Run?
            </h3>
            <p className="text-xs text-[#4B5A66] max-w-md mx-auto leading-relaxed">
              You will be presented with 10 real-world scenarios: incoming SMS requests, executive emergency calls, OTP validation prompts, and corporate emails.
            </p>
          </div>

          {/* Quick instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
              <Clock className="w-4 h-4 text-[#0E2238] mx-auto mb-1" />
              <span className="text-[#16232F] font-bold block">10 Seconds</span>
              <span className="text-[11px] text-[#4B5A66]">Fast tactical decision</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
              <Flame className="w-4 h-4 text-[#D79A45] mx-auto mb-1" />
              <span className="text-[#16232F] font-bold block">Combo Streaks</span>
              <span className="text-[11px] text-[#4B5A66]">Multiplier bonuses</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
              <Trophy className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <span className="text-[#16232F] font-bold block">CISO Ranking</span>
              <span className="text-[11px] text-[#4B5A66]">Earn Cyber XP</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-3 px-6 rounded-lg bg-[#0E2238] hover:bg-[#16232F] text-[#F3F5F1] font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gamepad2 className="w-5 h-5 text-[#5FD3BF]" />
            <span>Start Threat Blitz Run</span>
          </button>
        </div>
      )}

      {/* ACTIVE CARD QUESTION */}
      {gameState === 'playing' && (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-200">
          {/* Progress & Countdown Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-[#16232F] px-1">
            <span className="font-semibold">Scenario {currentIndex + 1} of 10</span>
            <span
              className={`font-bold flex items-center gap-1 tabular-nums ${
                timeLeft <= 3 ? 'text-red-700 animate-pulse' : 'text-[#0E2238]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> {timeLeft}s remaining
            </span>
          </div>

          <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#C7CDC0]">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 3 ? 'bg-red-600' : 'bg-[#2BB5A0]'
              }`}
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
          </div>

          {/* Incident Card Display */}
          <div className="p-6 rounded-xl bg-white border border-[#D9DDD3] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs">
                {currentCard.category === 'vishing' && (
                  <PhoneCall className="w-4 h-4 text-[#D79A45]" />
                )}
                {currentCard.category === 'phishing' && (
                  <Mail className="w-4 h-4 text-[#0E2238]" />
                )}
                {currentCard.category === 'malicious_link' && (
                  <LinkIcon className="w-4 h-4 text-red-700" />
                )}
                {currentCard.category === 'credential_theft' && (
                  <AlertOctagon className="w-4 h-4 text-red-700" />
                )}
                {currentCard.category === 'legitimate' && (
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                )}
                <span className="font-bold text-[#16232F] uppercase font-mono tracking-wider">
                  {currentCard.title}
                </span>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F3F5F1] text-[#4B5A66] border border-[#D9DDD3]">
                Incoming Event
              </span>
            </div>

            {/* Sender / Caller Header */}
            <div className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] font-mono text-xs text-[#16232F]">
              <span className="text-[#4B5A66] block text-[10px] uppercase">Origin / Caller:</span>
              <span className="text-[#0E2238] font-semibold">{currentCard.senderOrCaller}</span>
            </div>

            {/* Message Body Content */}
            <div className="p-4 rounded-lg bg-[#081420] border border-[#3E6E86]/40 text-sm text-[#EEF3F1] leading-relaxed font-sans min-h-[90px] flex items-center">
              &ldquo;{currentCard.content}&rdquo;
            </div>

            {/* Decision Buttons */}
            <div className="pt-2 grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => handleAnswer(true)}
                className="py-3 px-4 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>BLOCK &amp; REPORT THREAT</span>
              </button>

              <button
                type="button"
                onClick={() => handleAnswer(false)}
                className="py-3 px-4 rounded-lg bg-[#2BB5A0] hover:bg-[#5FD3BF] text-[#04211B] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ALLOW &amp; VERIFY LEGITIMATE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROUND REVIEW OVERLAY */}
      {gameState === 'round_review' && lastCardReviewed && (
        <div className="max-w-2xl mx-auto p-6 rounded-xl bg-white border border-[#D9DDD3] shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                lastAnswerCorrect
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {lastAnswerCorrect ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <XCircle className="w-7 h-7" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#16232F] flex items-center gap-2">
                {lastAnswerCorrect
                  ? 'Threat Identified Accurately!'
                  : 'Triage Error / Exploited!'}
                {lastAnswerCorrect && streak > 1 && (
                  <span className="text-xs font-mono text-amber-800 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                    +{streak}x Streak!
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#4B5A66]">
                This event was:{' '}
                <strong className="text-[#16232F]">
                  {lastCardReviewed.isThreat ? 'MALICIOUS THREAT' : 'LEGITIMATE ACTIVITY'}
                </strong>
                {lastCardReviewed.threatType && ` (${lastCardReviewed.threatType})`}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3] space-y-2 text-xs">
            <span className="text-[11px] font-mono text-[#0E2238] uppercase font-semibold block">
              Telltale Forensic Indicators:
            </span>
            <p className="text-[#16232F] leading-relaxed">
              {lastCardReviewed.telltaleExplanation}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0D1C2D] border border-[#3E6E86]/40 text-xs text-[#EEF3F1] leading-relaxed">
            <strong className="text-[#5FD3BF]">Rule of Thumb:</strong>{' '}
            {lastCardReviewed.ruleOfThumb}
          </div>

          <button
            type="button"
            onClick={handleNextCard}
            className="w-full py-3 rounded-lg bg-[#0E2238] hover:bg-[#16232F] text-[#F3F5F1] font-semibold text-xs transition cursor-pointer"
          >
            Continue to Next Scenario &rarr;
          </button>
        </div>
      )}

      {/* GAME OVER SUMMARY */}
      {gameState === 'game_over' && (
        <div className="max-w-xl mx-auto p-8 rounded-xl bg-white border border-[#D9DDD3] text-center space-y-6 shadow-sm animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-xl bg-[#0E2238] text-[#EBC385] mx-auto flex items-center justify-center shadow-md">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <span className="rm-kicker">Threat Blitz Completed</span>
            <h3 className="text-2xl font-bold text-[#16232F] mt-1 font-serif">
              Final Score: {score} pts
            </h3>
            <p className={`text-sm font-mono font-bold mt-1 ${rank.color}`}>
              Rank Awarded: {rank.title}
            </p>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
              <span className="text-[#4B5A66] block text-[10px]">Accuracy</span>
              <span className="text-lg font-bold text-emerald-700 tabular-nums">
                {Math.round((correctCount / (totalAnswered || 1)) * 100)}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
              <span className="text-[#4B5A66] block text-[10px]">Threats Neutralized</span>
              <span className="text-lg font-bold text-[#0E2238] tabular-nums">
                {correctCount} / 10
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F3F5F1] border border-[#D9DDD3]">
              <span className="text-[#4B5A66] block text-[10px]">High Score</span>
              <span className="text-lg font-bold text-[#D79A45] tabular-nums">
                {highScore} pts
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleStartGame}
              className="flex-1 py-3 rounded-lg bg-[#0E2238] hover:bg-[#16232F] text-[#F3F5F1] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#5FD3BF]" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
