import { useEffect, useState } from 'react';
import { BrainCircuit, Trophy, Zap, ArrowRight, BookOpen } from 'lucide-react';
import { useStore } from '../store';

interface WelcomeScreenProps {
    onStart: () => void;
    onSkipDiagnostic: () => void;
    onOpenManual: () => void;
}

const WelcomeScreen = ({ onStart, onSkipDiagnostic, onOpenManual }: WelcomeScreenProps) => {
    const [showLevelSelect, setShowLevelSelect] = useState(false);
    const { setUserProfile } = useStore();

    useEffect(() => {
        // Enable keyboard shortcut for quick start
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !showLevelSelect) {
                onStart();
            }
        };
        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [onStart, showLevelSelect]);

    const handleLevelSelect = (level: number) => {
        const xpForLevel = (level - 1) * (level - 1) * 100;
        setUserProfile((prev) => ({
            ...prev,
            level,
            xp: xpForLevel,
            hasCompletedDiagnostic: true,
        }));
        setShowLevelSelect(false);
        onSkipDiagnostic(); // Navigate directly to game
    };

    if (showLevelSelect) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in">
                <h2 className="text-3xl font-bold text-slate-200">Select Your Level</h2>
                <p className="text-slate-400 max-w-md">
                    Choose the level that best matches your current skill. You can always adjust later.
                </p>
                <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                        <button
                            key={level}
                            onClick={() => handleLevelSelect(level)}
                            className="p-4 bg-slate-800/60 border border-slate-700 hover:border-primary-500 rounded-lg font-bold text-2xl text-slate-200 hover:text-primary-400 transition-all hover:scale-105"
                        >
                            {level}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowLevelSelect(false)}
                    className="text-slate-500 hover:text-slate-300 text-sm underline"
                >
                    Back
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in">
            <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center justify-center p-3 bg-slate-800/80 rounded-full border border-slate-700 mb-4 shadow-inner">
                    <span className="text-primary-400 text-sm font-medium px-2">
                        ✨ AI-Powered Mental Math Coach
                    </span>
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 pb-2">
                    Unlock Your <br /> Numerical Intuition
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
                    Beyond simple drilling. Experience a hyper-personalized adaptive learning engine designed to
                    rewire your brain for speed and accuracy.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mt-8">
                {[
                    {
                        icon: BrainCircuit,
                        title: 'Adaptive AI',
                        desc: 'Targets your specific micro-skills.',
                    },
                    { icon: Trophy, title: 'Gamified', desc: 'Earn XP, level up, and compete.' },
                    {
                        icon: Zap,
                        title: 'Instant Feedback',
                        desc: 'Learn strategies, not just answers.',
                    },
                ].map((feature, idx) => (
                    <div
                        key={idx}
                        className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-colors text-left group"
                    >
                        <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <feature.icon className="w-5 h-5 text-primary-400" />
                        </div>
                        <h3 className="font-semibold text-slate-200 mb-1">{feature.title}</h3>
                        <p className="text-sm text-slate-500">{feature.desc}</p>
                    </div>
                ))}
            </div>

            <div className="pt-8 w-full max-w-md space-y-3">
                <button
                    onClick={onStart}
                    className="w-full group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl font-bold text-lg shadow-lg shadow-primary-900/20 hover:shadow-primary-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full"></div>
                    <span className="relative flex items-center justify-center space-x-2">
                        <span>Start Training Session</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
                <button
                    onClick={() => setShowLevelSelect(true)}
                    className="w-full text-slate-500 hover:text-slate-300 text-sm underline transition-colors"
                >
                    Skip Diagnostic (Advanced Users)
                </button>
                <p className="text-xs text-slate-600">Press 'Enter' to start immediately</p>

                <button
                    onClick={onOpenManual}
                    className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-slate-300 transition-colors flex items-center justify-center space-x-2"
                >
                    <BookOpen className="w-5 h-5" />
                    <span>Open Field Manual</span>
                </button>
            </div>
        </div>
    );
};

export default WelcomeScreen;
