import React from 'react';
import { X, Lightbulb } from 'lucide-react';

interface BreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    steps: string[];
    strategyName?: string;
}

export const BreakdownModal: React.FC<BreakdownModalProps> = ({ isOpen, onClose, steps, strategyName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl glass shadow-elegant animate-slide-up border border-white/20">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-amber-400/20 text-amber-400">
                            <Lightbulb size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Let's Break It Down</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {strategyName && (
                        <div className="text-sm font-medium text-blue-300 uppercase tracking-wider mb-2">
                            Strategy: {strategyName}
                        </div>
                    )}

                    <div className="space-y-3">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="flex gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold mt-0.5">
                                    {index + 1}
                                </div>
                                <p className="text-gray-100 text-lg leading-relaxed">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};
