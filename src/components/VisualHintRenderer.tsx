import React from 'react';
import type { Hint } from '../engine/MentalMathHints';

interface VisualHintRendererProps {
    hint: Hint;
    visualEnabled: boolean;
}

// Helper to render text with markdown-style bolding (**text**)
const renderStyledText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-primary-400 font-bold">{part.slice(2, -2)}</strong>;
        }
        // Handle newlines as breaks
        return part.split('\n').map((subPart, subIndex) => (
            <React.Fragment key={`${index}-${subIndex}`}>
                {subIndex > 0 && <br />}
                {subPart}
            </React.Fragment>
        ));
    });
};

export const VisualHintRenderer: React.FC<VisualHintRendererProps> = ({ hint, visualEnabled }) => {
    const renderVisual = () => {
        if (!hint.visual) return null;
        const { steps, title } = hint.visual;

        return (
            <div className="mt-4 bg-slate-900/50 rounded-lg p-3 border border-slate-700 animate-in fade-in slide-in-from-top-2">
                {title && <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider text-left">{title}</div>}
                <div className="space-y-2">
                    {steps.map((step, idx) => (
                        <div key={idx} className={`flex items-center justify-between text-sm ${step.highlight ? 'text-primary-400 font-bold text-base border-t border-slate-700 pt-1 mt-1' : 'text-slate-300'}`}>
                            <span>{step.label}</span>
                            <div className="flex items-center space-x-2">
                                {step.operation && <span className="text-slate-500 font-mono">{step.operation}</span>}
                                <span className="font-mono">{step.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="text-sm text-slate-300 text-center leading-relaxed">
            {renderStyledText(hint.text)}
            {visualEnabled && renderVisual()}
        </div>
    );
};
