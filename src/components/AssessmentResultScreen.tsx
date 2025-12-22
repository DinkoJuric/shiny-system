import { Check, ArrowRight } from 'lucide-react';
import type { DiagnosticReport } from '../engine/DiagnosticEngine';

interface Props {
    report: DiagnosticReport;
    onStartTraining: () => void;
}

const AssessmentResultScreen = ({ report, onStartTraining }: Props) => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in text-center space-y-6 w-full max-w-4xl mx-auto">
        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-900/50 mb-4">
            <Check className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-slate-100">Assessment Complete!</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Recommendation column */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4 flex flex-col justify-center">
                <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
                    Recommended Level
                </p>
                <p className="text-5xl font-bold text-primary-400 my-2">
                    Level {report.recommendedLevel}
                </p>
                <p className="text-slate-300 text-sm">
                    {report.overallAccuracy > 0.9
                        ? 'You have excellent mastery of the basics! We’ll start you with advanced challenges.'
                        : report.overallAccuracy > 0.7
                            ? 'You have a solid foundation. We’ll focus on polishing speed and accuracy.'
                            : 'We’ll begin from the basics to build a strong mental‑math foundation.'}
                </p>

                {report.weaknesses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-red-300 text-sm font-semibold mb-2">Focus Areas:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {report.weaknesses.map((w) => (
                                <span
                                    key={w}
                                    className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs border border-red-500/30"
                                >
                                    {w.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join(' ')}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed skill breakdown */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4 text-left">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Skill Breakdown</h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(report.detailedStats).map(([skill, stats]) => {
                        const accuracy = stats.total ? (stats.correct / stats.total) * 100 : 0;
                        const avgTime = stats.total ? stats.totalTime / stats.total : 0;
                        const isWeak = report.weaknesses.includes(skill);
                        return (
                            <div key={skill} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className={`font-medium ${isWeak ? 'text-red-300' : 'text-slate-300'}`}>
                                        {skill.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join(' ')}
                                    </span>
                                    <span className="text-slate-400 text-xs">{avgTime.toFixed(1)}s avg</span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
                                    <div
                                        className={`h-full ${accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${accuracy}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>{stats.correct}/{stats.total} correct</span>
                                    <span>{Math.round(accuracy)}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        <button
            onClick={onStartTraining}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold shadow-lg transition-colors flex items-center space-x-2 mt-4"
        >
            <span>Start Personalized Training</span>
            <ArrowRight className="w-4 h-4" />
        </button>
    </div>
);

export default AssessmentResultScreen;
