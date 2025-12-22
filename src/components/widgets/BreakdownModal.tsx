import type { TutorGuide } from '../../engine/TutorEngine';
import { XCircle, Lightbulb, CheckCircle2 } from 'lucide-react';

interface BreakdownModalProps {
    guide: TutorGuide | null;
    isOpen: boolean;
    onClose: () => void;
}

export function BreakdownModal({ guide, isOpen, onClose }: BreakdownModalProps) {
    if (!isOpen || !guide) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-elegant max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">

                {/* Header */} /* ... same ... */
                <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
                    <div>
                        <div className="flex items-center space-x-2 text-red-400 mb-1">
                            <XCircle className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-wider text-xs">{guide.errorType.replace(/_/g, ' ')}</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-100">Let's Break It Down</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Strategy Hint */}
                    <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4 flex gap-4 shadow-sm">
                        <div className="bg-indigo-500/20 p-2 rounded-lg h-fit">
                            <Lightbulb className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-indigo-300 text-sm mb-1">Concept Strategy</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">{guide.strategy}</p>
                        </div>
                    </div>

                    {/* Step by Step */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Step-by-Step Solution</h3>
                        <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 pl-8 py-2">
                            {guide.steps.map((step, index) => (
                                <div key={index} className="relative group" style={{ animationDelay: `${index * 150}ms` }}>
                                    <div className="absolute -left-[39px] top-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-400 transition-colors">
                                        {index + 1}
                                    </div>
                                    <p className="text-slate-200 font-medium mb-1">{step.text}</p>
                                    {step.subCalculation && (
                                        <div className="font-mono text-sm text-emerald-400 bg-emerald-950/10 px-3 py-1.5 rounded-lg w-fit border border-emerald-900/30 shadow-sm mt-1">
                                            {step.subCalculation}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {/* Final Check */}
                            <div className="relative">
                                <div className="absolute -left-[39px] top-0 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-emerald-400 font-bold text-lg">Solved!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg transition-all focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
}
