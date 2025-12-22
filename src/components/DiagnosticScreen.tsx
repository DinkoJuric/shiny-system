import { useState, useEffect, useRef } from 'react';
import { DiagnosticEngine } from '../engine/DiagnosticEngine';
import { Check, ArrowRight } from 'lucide-react';

interface DiagnosticScreenProps {
    onComplete: (report: any) => void;
}

const DiagnosticScreen = ({ onComplete }: DiagnosticScreenProps) => {
    const [engine] = useState(() => new DiagnosticEngine());
    const [currentProblem, setCurrentProblem] = useState<any>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<any>(null);
    const [startTime, setStartTime] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [report, setReport] = useState<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadNextProblem();
    }, []);

    const loadNextProblem = () => {
        const problem = engine.getNextProblem();
        if (!problem) {
            finishAssessment();
            return;
        }
        setCurrentProblem(problem);
        setUserAnswer('');
        setFeedback(null);
        setStartTime(Date.now());
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const finishAssessment = () => {
        const resultReport = engine.generateReport();
        setReport(resultReport);
        setIsFinished(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProblem || !userAnswer) return;

        const timeTaken = (Date.now() - startTime) / 1000;
        const result = engine.processResult(currentProblem, userAnswer, timeTaken);

        setFeedback(result);

        setTimeout(() => {
            if (result.isComplete) {
                finishAssessment();
            } else {
                loadNextProblem();
            }
        }, 800);
    };

    if (isFinished && report) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in text-center space-y-6 w-full max-w-4xl mx-auto">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-900/50 mb-4">
                    <Check className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-slate-100">Assessment Complete!</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {/* Left Column: Recommendation */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4 flex flex-col justify-center">
                        <div>
                            <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
                                Recommended Level
                            </p>
                            <p className="text-5xl font-bold text-primary-400 my-2">Level {report.recommendedLevel}</p>
                            <p className="text-slate-300 text-sm">
                                {report.overallAccuracy > 0.9
                                    ? "You have excellent mastery of the basics! We'll start you with some advanced challenges."
                                    : report.overallAccuracy > 0.7
                                        ? "You have a good foundation. We'll focus on polishing your speed and accuracy."
                                        : "We'll start from the beginning to build a strong mental math foundation."}
                            </p>
                        </div>

                        {report.weaknesses.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <p className="text-red-300 text-sm font-semibold mb-2">Focus Areas:</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {report.weaknesses.map((w: string) => (
                                        <span
                                            key={w}
                                            className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs border border-red-500/30"
                                        >
                                            {w.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Detailed Stats */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4 text-left">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Skill Breakdown</h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {Object.entries(report.detailedStats).map(([skill, stats]: [string, any]) => {
                                const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                                const avgTime = stats.total > 0 ? stats.totalTime / stats.total : 0;
                                const isWeakness = report.weaknesses.includes(skill);

                                return (
                                    <div key={skill} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className={`font-medium ${isWeakness ? 'text-red-300' : 'text-slate-300'}`}>
                                                {skill.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                                            </span>
                                            <span className="text-slate-400 text-xs">{avgTime.toFixed(1)}s avg</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
                                            <div
                                                className={`h-full ${accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${accuracy}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>{stats.correct}/{stats.total} Correct</span>
                                            <span>{Math.round(accuracy)}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onComplete(report)}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold shadow-lg transition-colors flex items-center space-x-2 mt-4"
                >
                    <span>Start Personalized Training</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    if (!currentProblem) return <div className="text-white">Loading Assessment...</div>;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto animate-in">
            <div className="w-full mb-8">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Diagnostic Assessment</span>
                    <span>{currentProblem.progress}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary-500 transition-all duration-500"
                        style={{
                            width: `${(parseInt(currentProblem.progress.split('/')[0]) /
                                parseInt(currentProblem.progress.split('/')[1])) *
                                100
                                }%`,
                        }}
                    ></div>
                </div>
            </div>

            <div className="mb-12 text-center space-y-2">
                <div className="text-6xl md:text-8xl font-bold text-slate-100 tracking-tight">
                    {currentProblem.num1} {currentProblem.operation} {currentProblem.num2}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-xs relative">
                <input
                    ref={inputRef}
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className={`w-full bg-transparent border-b-4 text-center text-4xl py-4 focus:outline-none transition-colors duration-300 placeholder-slate-700 ${feedback
                        ? feedback.isCorrect
                            ? 'border-green-500 text-green-400'
                            : 'border-red-500 text-red-400'
                        : 'border-slate-600 text-slate-100 focus:border-primary-500'
                        }`}
                    placeholder="?"
                    autoFocus
                />
            </form>
        </div>
    );
};

export default DiagnosticScreen;
