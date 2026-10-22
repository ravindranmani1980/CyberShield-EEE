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
  Award,
  Share2,
  AlertOctagon,
  PhoneCall,
  Mail,
  Link as LinkIcon,
  HelpCircle,
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
      // Time expired: auto-fail this card
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
      // End of round (10 questions)
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
    if (scoreVal >= 1600) return { title: 'Legendary CISO Guardian', color: 'text-emerald-400' };
    if (scoreVal >= 1200) return { title: 'Lead Threat Hunter', color: 'text-cyan-400' };
    if (scoreVal >= 800) return { title: 'SOC Incident Responder', color: 'text-indigo-400' };
    if (scoreVal >= 400) return { title: 'Security Analyst Tier 1', color: 'text-amber-400' };
    return { title: 'Security Apprentice', color: 'text-slate-400' };
  };

  const currentCard = cards[currentIndex] || GAME_CARDS[0];
  const rank = getRank(score);

  return (
    <div className="space-y-6">
      {/* Top Banner and Score HUD */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Gamepad2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Cyber Threat Blitz: Speed Triage Game
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  TRAINING LAB
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Test your instincts in 10 seconds: distinguish real security alerts from phishing, vishing, and OTP theft.
              </p>
            </div>
          </div>
        </div>

        {/* Live Score & Streak Display */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">Current Score</span>
            <span className="text-lg font-mono font-bold text-amber-400">{score} pts</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">Combo Streak</span>
            <span className="text-lg font-mono font-bold text-rose-400 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500" /> {streak}x
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">Best Record</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{highScore} pts</span>
          </div>
        </div>
      </div>

      {/* GAME SCREEN */}
      {gameState === 'start' && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-indigo-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center shadow-xl shadow-amber-950/40">
            <Zap className="w-10 h-10 text-amber-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Ready for the Threat Triage Speed Run?
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              You will be presented with 10 real-world scenarios: incoming SMS requests, executive emergency calls, OTP validation prompts, and corporate emails.
            </p>
          </div>

          {/* Quick instructions pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <span className="text-slate-300 font-bold block">10 Seconds</span>
              <span className="text-[11px] text-slate-500">Fast tactical decision</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <Flame className="w-4 h-4 text-rose-400 mx-auto mb-1" />
              <span className="text-slate-300 font-bold block">Combo Streaks</span>
              <span className="text-[11px] text-slate-500">Multiplier bonuses</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-slate-300 font-bold block">CISO Ranking</span>
              <span className="text-[11px] text-slate-500">Earn Cyber XP</span>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-bold text-sm transition shadow-xl shadow-amber-950/50 flex items-center justify-center gap-2"
          >
            <Gamepad2 className="w-5 h-5" /> Start Threat Blitz Run
          </button>
        </div>
      )}

      {/* ACTIVE CARD QUESTION */}
      {gameState === 'playing' && (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-200">
          {/* Progress & Countdown Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>Scenario {currentIndex + 1} of 10</span>
            <span className={`font-bold flex items-center gap-1 ${timeLeft <= 3 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>
              <Clock className="w-3.5 h-3.5" /> {timeLeft}s remaining
            </span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 3 ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
              }`}
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
          </div>

          {/* Incident Card Display */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                {currentCard.category === 'vishing' && <PhoneCall className="w-4 h-4 text-amber-400" />}
                {currentCard.category === 'phishing' && <Mail className="w-4 h-4 text-cyan-400" />}
                {currentCard.category === 'malicious_link' && <LinkIcon className="w-4 h-4 text-rose-400" />}
                {currentCard.category === 'credential_theft' && <AlertOctagon className="w-4 h-4 text-rose-400" />}
                {currentCard.category === 'legitimate' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                <span className="font-bold text-white uppercase font-mono tracking-wider">
                  {currentCard.title}
                </span>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                Incoming Event
              </span>
            </div>

            {/* Sender / Caller Header */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase">Origin / Caller:</span>
              <span className="text-cyan-300 font-semibold">{currentCard.senderOrCaller}</span>
            </div>

            {/* Message Body Content */}
            <div className="p-4 rounded-2xl bg-black/40 border border-slate-800/80 text-sm text-slate-100 leading-relaxed font-sans min-h-[90px] flex items-center">
              "{currentCard.content}"
            </div>

            {/* Decision Buttons */}
            <div className="pt-2 grid grid-cols-2 gap-3.5">
              <button
                onClick={() => handleAnswer(true)}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-rose-950 group"
              >
                <ShieldAlert className="w-4 h-4 group-hover:scale-110 transition" />
                BLOCK & REPORT THREAT
              </button>

              <button
                onClick={() => handleAnswer(false)}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950 group"
              >
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition" />
                ALLOW & VERIFY LEGITIMATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROUND REVIEW OVERLAY */}
      {gameState === 'round_review' && lastCardReviewed && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                lastAnswerCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {lastAnswerCorrect ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {lastAnswerCorrect ? 'Threat Identified Accurately!' : 'Triage Error / Exploited!'}
                {lastAnswerCorrect && streak > 1 && (
                  <span className="text-xs font-mono text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    +{streak}x Streak!
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                This event was: <strong>{lastCardReviewed.isThreat ? 'MALICIOUS THREAT' : 'LEGITIMATE ACTIVITY'}</strong>
                {lastCardReviewed.threatType && ` (${lastCardReviewed.threatType})`}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold block">
              Telltale Forensic Indicators:
            </span>
            <p className="text-slate-300 leading-relaxed">
              {lastCardReviewed.telltaleExplanation}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
            <strong>Rule of Thumb:</strong> {lastCardReviewed.ruleOfThumb}
          </div>

          <button
            onClick={handleNextCard}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-950"
          >
            Continue to Next Scenario &rarr;
          </button>
        </div>
      )}

      {/* GAME OVER SUMMARY */}
      {gameState === 'game_over' && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-mono uppercase text-slate-400">Threat Blitz Completed</span>
            <h3 className="text-2xl font-bold text-white mt-1">Final Score: {score} pts</h3>
            <p className={`text-sm font-mono font-bold mt-1 ${rank.color}`}>
              Rank Awarded: {rank.title}
            </p>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Accuracy</span>
              <span className="text-lg font-bold text-emerald-400">
                {Math.round((correctCount / (totalAnswered || 1)) * 100)}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Threats Neutralized</span>
              <span className="text-lg font-bold text-cyan-400">{correctCount} / 10</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">High Score</span>
              <span className="text-lg font-bold text-amber-400">{highScore} pts</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartGame}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
