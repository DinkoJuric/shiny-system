import { ArrowRight, CheckCircle, Clock, Target, BookOpen } from 'lucide-react';

interface SessionSummaryProps {
    summary: {
        accuracy: number;
        avgSpeed: number;
        totalProblems: number;
        struggledSkillKey: string | null;
        lowestAccuracy: number;
    };
    guidance: {
        title: string;
        steps: string[];
    };
    onContinue: () => void;
}

const SessionSummary = ({ summary, guidance, onContinue }: SessionSummaryProps) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8">
            <h2 className="text-3xl font-bold text-white mb-8">Session Complete!</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
                {/* Stats Cards */}
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col items-center justify-center space-y-2">
                    <Target className="w-8 h-8 text-primary-400" />
                    <span className="text-2xl font-bold text-white">{Math.round(summary.accuracy)}%</span>
                    <span className="text-sm text-slate-400">Accuracy</span>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col items-center justify-center space-y-2">
                    <Clock className="w-8 h-8 text-secondary-400" />
                    <span className="text-2xl font-bold text-white">{summary.avgSpeed.toFixed(1)}s</span>
                    <span className="text-sm text-slate-400">Avg Speed</span>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col items-center justify-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <span className="text-2xl font-bold text-white">{summary.totalProblems}</span>
                    <span className="text-sm text-slate-400">Problems Solved</span>
                </div>
            </div>

            {/* Extended Guidance Card */}
            <div className="w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary-500/10 rounded-lg">
                        <BookOpen className="w-6 h-6 text-primary-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{guidance.title}</h3>
                        <p className="text-slate-400 mb-6">
                            Based on your session, here's a strategy to help you improve:
                        </p>
                        <div className="space-y-4">
                            {guidance.steps.map((step, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                        {index + 1}
                                    </div>
                                    <p className="text-slate-300">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onContinue}
                className="mt-12 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-opacity flex items-center space-x-2 shadow-lg shadow-primary-900/20"
            >
                <span>Continue Training</span>
                <ArrowRight className="w-5 h-5" />
            </button>
        </div>
    );
};

export default SessionSummary;
