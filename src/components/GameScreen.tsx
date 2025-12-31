import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { AdaptiveEngine, type ProblemResult } from '../engine/AdaptiveEngine';
import { ExperienceEngine } from '../engine/ExperienceEngine';
import { Flame, Info } from 'lucide-react';
import SessionSummary from './SessionSummary';
import { VisualHintRenderer } from './VisualHintRenderer';
import { logger } from '../utils/logger';
import { TutorEngine } from '../engine/TutorEngine';
import type { TutorState } from '../engine/TutorEngine';
import { BreakdownModal } from './widgets/BreakdownModal';
import { DiagnosticEngine } from '../engine/DiagnosticEngine';

const GameScreen = () => {
    const { userProfile, updateProfile } = useStore();
    const [engine] = useState(() => new AdaptiveEngine(userProfile));
    // Instantiate TutorEngine. We can reuse the DiagnosticEngine instance if AdaptiveEngine exposes it, 
    // or create a new one. AdaptiveEngine likely uses DiagnosticEngine internally, but for now capturing logic we'll create one.
    // Ideally AdaptiveEngine should expose it or we pass it in. 
    // Let's assume for now we create a lightweight instance or if AdaptiveEngine has it.
    // Looking at imports, DiagnosticEngine is available.
    const [tutorEngine] = useState(() => new TutorEngine(new DiagnosticEngine()));

    const [currentProblem, setCurrentProblem] = useState<any>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<ProblemResult | null>(null);
    const [stats, setStats] = useState({ streak: 0, score: 0 });
    const [startTime, setStartTime] = useState(Date.now());
    const [showSummary, setShowSummary] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [xpGained, setXpGained] = useState(0);

    // Tutor Engine Extensions
    const [tutorState, setTutorState] = useState<TutorState>({ shouldShowBreakdown: false, solutionSteps: [] });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [drillQueue, setDrillQueue] = useState<any[]>([]); // Queue for drill problems

    // Initial Load
    useEffect(() => {
        loadNextProblem();
    }, []);

    // Session Limit Check (e.g., 10 questions)
    const questionsAnswered = engine.getSessionSummary().totalProblems;
    useEffect(() => {
        if (questionsAnswered > 0 && questionsAnswered % 10 === 0 && !feedback) {
            setShowSummary(true);
        }
    }, [questionsAnswered, feedback]);

    const loadNextProblem = () => {
        let problem;

        if (drillQueue.length > 0) {
            const [nextDrill, ...remaining] = drillQueue;
            problem = nextDrill;
            setDrillQueue(remaining);
        } else {
            problem = engine.getNextProblem();
            if (problem) {
                tutorEngine.resetForNewProblem(problem);
            }
        }

        setCurrentProblem(problem);
        setUserAnswer('');
        setFeedback(null);
        setShowHint(false);
        setTutorState({ shouldShowBreakdown: false, solutionSteps: [] }); // Reset tutor state
        setIsModalOpen(false);
        setStartTime(Date.now());
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProblem || feedback) return;

        const timeTaken = (Date.now() - startTime) / 1000;
        const result = engine.processResult(currentProblem, userAnswer, timeTaken);

        setFeedback(result);
        setStats(prev => ({
            streak: result.streak,
            score: prev.score + (result.isCorrect ? 10 : 0) // Simple score
        }));

        // Tutor Orchestrator Check
        const newTutorState = tutorEngine.handleAttempt(currentProblem, result.isCorrect);
        setTutorState(newTutorState);

        if (newTutorState.shouldShowBreakdown) {
            setTimeout(() => setIsModalOpen(true), 1500); // Small delay to let user see "Incorrect" first
        }

        // XP Calculation & Level Up
        const xp = ExperienceEngine.calculateXP(result.isCorrect, timeTaken, userProfile.level || 1, result.streak);
        if (xp > 0) {
            setXpGained(xp);
            updateProfile({ xp: (userProfile.xp || 0) + xp });
            setTimeout(() => setXpGained(0), 1000);
        }

        logger.info('Problem Answered', { problemId: currentProblem.id, isCorrect: result.isCorrect });

        if (result.isCorrect) {
            setTimeout(loadNextProblem, 1000); // Auto-advance if correct
        }
    };

    // ... existing handlers ...

    const handleContinue = () => {
        setShowSummary(false);
        setStats({ streak: 0, score: 0 }); // Reset stats
        loadNextProblem();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && feedback && !feedback.isCorrect) {
            e.preventDefault();
            loadNextProblem();
        }
    };

    if (showSummary) {
        const summary = engine.getSessionSummary();
        const guidance = engine.getDetailedBreakdown(summary.struggledSkillKey || 'addition_basic');
        return <SessionSummary summary={summary} guidance={guidance} onContinue={handleContinue} />;
    }

    if (!currentProblem) return <div className="text-white">Loading...</div>;

    const levelInfo = ExperienceEngine.getLevelProgress(userProfile.xp || 0);
    const isDrillMode = drillQueue.length > 0 || (currentProblem.id && currentProblem.id.startsWith('drill'));

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto animate-in relative -mt-16 overflow-visible">
            <BreakdownModal
                steps={tutorState.solutionSteps}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            {/* ... rest of render ... */}
            {userProfile.activePlan && !isDrillMode && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-primary-500/20 border border-primary-500/30 px-4 py-1 rounded-full flex items-center space-x-2 whitespace-nowrap">
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold text-primary-300 uppercase tracking-wider">Training Plan: {userProfile.activePlan.name}</span>
                </div>
            )}

            {drillQueue.length > 0 && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-amber-500/20 border border-amber-500/30 px-4 py-1 rounded-full flex items-center space-x-2 whitespace-nowrap">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Drill Mode: {drillQueue.length + 1} Remaining</span>
                </div>
            )}

            {/* XP Floating Animation */}
            {xpGained > 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full text-4xl font-bold text-yellow-400 animate-bounce z-50 pointer-events-none drop-shadow-lg">
                    +{xpGained} XP
                </div>
            )}

            {/* Top Bar: Stats & Level */}
            <div className="w-full flex justify-between items-end mb-8 text-slate-400 font-medium">
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                        <span className="text-primary-400 font-bold">Lvl {levelInfo.level}</span>
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-500 transition-all duration-500"
                                style={{ width: `${levelInfo.progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Flame
                            className={`w-5 h-5 ${stats.streak > 2 ? 'text-orange-500 animate-pulse' : 'text-slate-600'
                                }`}
                        />
                        <span>{stats.streak}</span>
                    </div>
                    <div className="text-slate-600 text-sm">
                        {questionsAnswered % 10} / 10
                    </div>
                </div>
            </div>

            {/* Problem Display */}
            <div className="mb-4 text-center space-y-2">
                {currentProblem.question ? (
                    <div className="text-2xl md:text-3xl font-medium text-slate-100 leading-relaxed max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                        {currentProblem.question}
                    </div>
                ) : (
                    <div className="text-6xl md:text-8xl font-bold text-slate-100 tracking-tight">
                        {currentProblem.num1} {currentProblem.operation} {currentProblem.num2}
                    </div>
                )}
                {!currentProblem.question && <div className="text-2xl text-slate-500 font-light">= ?</div>}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="w-full max-w-xs relative">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode={currentProblem.type.includes('fraction') ? 'text' : 'numeric'}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`w-full bg-transparent border-b-4 text-center text-4xl py-4 focus:outline-none transition-colors duration-300 placeholder-slate-700 ${feedback
                            ? feedback.isCorrect
                                ? 'border-green-500 text-green-400'
                                : 'border-red-500 text-red-400'
                            : 'border-slate-600 text-slate-100 focus:border-primary-500'
                            }`}
                        placeholder={currentProblem.type.includes('fraction') ? "a/b" : "#"}
                        autoFocus
                        autoComplete="off"
                    />
                    {/* Info Button */}
                    {!feedback && (
                        <button
                            type="button"
                            onClick={() => setShowHint(!showHint)}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12 text-slate-500 hover:text-primary-400 transition-colors p-2"
                            title="Get a hint"
                        >
                            <Info className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Hint Display */}
                {showHint && !feedback && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-80 max-h-64 overflow-y-auto bg-slate-800/95 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl animate-in fade-in slide-in-from-bottom-2 z-20">
                        <VisualHintRenderer hint={engine.getStrategyHint(currentProblem)} visualEnabled={userProfile.visualHintsEnabled || false} />
                    </div>
                )}

                {/* Feedback Overlay */}
                <div
                    className={`absolute top-full left-0 w-full text-center transition-opacity duration-300 mt-4 ${feedback ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {feedback && (
                        <div className="space-y-2">
                            <span
                                className={`text-lg font-medium block ${feedback.isCorrect ? 'text-green-400' : 'text-red-400'
                                    }`}
                            >
                                {feedback.feedback}
                            </span>
                            {!feedback.isCorrect && (
                                <>
                                    <div className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                                        {feedback.strategyHint && (
                                            <VisualHintRenderer hint={feedback.strategyHint} visualEnabled={userProfile.visualHintsEnabled || false} />
                                        )}
                                    </div>
                                    <span className="block text-sm text-slate-500 mt-1">
                                        Answer: {feedback.correctAnswer}{' '}
                                        <span className="text-xs opacity-50">(Press Enter)</span>
                                    </span>
                                    {/* Manual Trigger for Tutor */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const breakdown = tutorEngine.getBreakdown(currentProblem);
                                            setTutorState(breakdown);
                                            setIsModalOpen(true);
                                        }}
                                        className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4 font-medium transition-colors"
                                    >
                                        Wait, explain why?
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>


                {!feedback && (
                    <div className="flex gap-2 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setUserAnswer('SKIP');
                                handleSubmit(new Event('submit') as any);
                            }}
                            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>Skip</span>
                        </button>
                        <button
                            type="submit"
                            disabled={!userAnswer}
                            className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>Submit</span>
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default GameScreen;
