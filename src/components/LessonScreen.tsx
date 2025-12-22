import { useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Trophy } from 'lucide-react';
import { MENTAL_MATH_MANUAL, type MentalMathProtocol } from '../engine/MentalMathHints';
import { useStore } from '../store';
import { AdaptiveEngine } from '../engine/AdaptiveEngine';

interface LessonScreenProps {
    onBack: () => void;
}

type LessonStage = 'list' | 'briefing' | 'example' | 'drill' | 'complete';

const LessonScreen = ({ onBack }: LessonScreenProps) => {
    const { userProfile } = useStore();
    const [activeProtocol, setActiveProtocol] = useState<MentalMathProtocol | null>(null);
    const [stage, setStage] = useState<LessonStage>('list');
    const [exampleIndex, setExampleIndex] = useState(0);
    const [exampleStepIndex, setExampleStepIndex] = useState(0);

    // Drill state
    const [drillProblem, setDrillProblem] = useState<any>(null);
    const [drillCount, setDrillCount] = useState(0);
    const [drillScore, setDrillScore] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);

    const engine = new AdaptiveEngine(userProfile);

    const startLesson = (protocol: MentalMathProtocol) => {
        setActiveProtocol(protocol);
        setStage('briefing');
        setExampleIndex(0);
        setExampleStepIndex(0);
        setDrillCount(0);
        setDrillScore(0);
    };

    const nextExampleStep = () => {
        if (!activeProtocol) return;
        const currentExample = activeProtocol.examples[exampleIndex];

        if (exampleStepIndex < currentExample.steps.length - 1) {
            setExampleStepIndex(prev => prev + 1);
        } else if (exampleIndex < activeProtocol.examples.length - 1) {
            setExampleIndex(prev => prev + 1);
            setExampleStepIndex(0);
        } else {
            startDrill();
        }
    };

    const startDrill = () => {
        setStage('drill');
        loadDrillProblem();
    };

    const loadDrillProblem = () => {
        // Map protocol to skill key (simple mapping for now)
        let skillKey = 'addition_basic';
        let useWordProblem = false;

        if (activeProtocol?.title.includes('SQUARE ROOT')) skillKey = 'roots_basic';
        else if (activeProtocol?.title.includes('SQUARING')) skillKey = 'powers_basic';
        else if (activeProtocol?.title.includes('CUBE')) skillKey = 'powers_basic'; // Need cube skill
        else if (activeProtocol?.title.includes('MULTIPLICATION')) skillKey = 'mult_double_single';

        // 50% chance of word problem in drill
        useWordProblem = Math.random() > 0.5;

        const problem = engine.getLessonProblem(skillKey, useWordProblem);
        setDrillProblem(problem);
        setUserAnswer('');
        setFeedback(null);
    };

    const handleDrillSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!drillProblem) return;

        const isCorrect = userAnswer.trim() === drillProblem.answer.toString();

        if (isCorrect) {
            setFeedback('Correct!');
            setDrillScore(prev => prev + 1);
            setTimeout(() => {
                if (drillCount < 4) { // 5 problems total
                    setDrillCount(prev => prev + 1);
                    loadDrillProblem();
                } else {
                    setStage('complete');
                }
            }, 1000);
        } else {
            setFeedback(`Not quite. Answer: ${drillProblem.answer}`);
            setTimeout(() => {
                if (drillCount < 4) {
                    setDrillCount(prev => prev + 1);
                    loadDrillProblem();
                } else {
                    setStage('complete');
                }
            }, 2000);
        }
    };

    if (stage === 'list') {
        return (
            <div className="flex-1 flex flex-col p-6 w-full max-w-2xl mx-auto animate-in fade-in">
                <div className="flex items-center mb-8">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors mr-4">
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-100">Field Manual</h1>
                </div>

                <div className="space-y-4">
                    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 mb-6">
                        <h2 className="text-primary-400 font-bold mb-2">{MENTAL_MATH_MANUAL.mindset.title}</h2>
                        <p className="text-slate-300 italic">"{MENTAL_MATH_MANUAL.mindset.text}"</p>
                    </div>

                    {MENTAL_MATH_MANUAL.protocols.map((protocol) => (
                        <button
                            key={protocol.protocol_number}
                            onClick={() => startLesson(protocol)}
                            className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-primary-500 rounded-xl transition-all text-left group"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">
                                        Protocol {protocol.protocol_number}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-100 mt-1">{protocol.title}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{protocol.mission}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-primary-400 transition-colors" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (stage === 'briefing' && activeProtocol) {
        return (
            <div className="flex-1 flex flex-col p-6 w-full max-w-2xl mx-auto animate-in slide-in-from-right">
                <div className="flex-1 flex flex-col justify-center space-y-8">
                    <div className="text-center">
                        <span className="text-primary-500 font-bold tracking-widest uppercase">Protocol {activeProtocol.protocol_number}</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mt-2">{activeProtocol.title}</h1>
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
                        <div>
                            <h3 className="text-slate-400 text-sm uppercase tracking-wider font-bold">Mission</h3>
                            <p className="text-xl text-slate-200">{activeProtocol.mission}</p>
                        </div>
                        <div>
                            <h3 className="text-slate-400 text-sm uppercase tracking-wider font-bold">Tactic</h3>
                            <p className="text-xl text-primary-400 font-medium">{activeProtocol.tactic}</p>
                        </div>
                        {activeProtocol.note && (
                            <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                                <p className="text-yellow-200 text-sm">{activeProtocol.note}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            if (activeProtocol.examples.length > 0) {
                                setStage('example');
                            } else {
                                startDrill();
                            }
                        }}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 rounded-xl font-bold text-lg transition-colors flex items-center justify-center space-x-2"
                    >
                        <span>Start Training</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'example' && activeProtocol) {
        const example = activeProtocol.examples[exampleIndex];
        const step = example.steps[exampleStepIndex];

        return (
            <div className="flex-1 flex flex-col p-6 w-full max-w-2xl mx-auto animate-in fade-in">
                <div className="mb-8">
                    <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
                        <span>Example {exampleIndex + 1} / {activeProtocol.examples.length}</span>
                        <span>Step {exampleStepIndex + 1} / {example.steps.length}</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 transition-all duration-300"
                            style={{ width: `${((exampleStepIndex + 1) / example.steps.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                    <div className="text-5xl font-bold text-slate-100">{example.target}</div>

                    <div className="w-full bg-slate-800 p-6 rounded-xl border border-slate-700 animate-in slide-in-from-bottom-4">
                        <h3 className="text-primary-400 font-bold text-lg mb-4">{step.step_title}</h3>
                        <div className="space-y-2">
                            {step.details.map((detail, idx) => (
                                <p key={idx} className="text-slate-200 text-lg">{detail}</p>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={nextExampleStep}
                    className="mt-8 w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-lg transition-colors flex items-center justify-center space-x-2"
                >
                    <span>{exampleStepIndex === example.steps.length - 1 ? 'Next' : 'Continue'}</span>
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        );
    }

    if (stage === 'drill' && drillProblem) {
        return (
            <div className="flex-1 flex flex-col p-6 w-full max-w-2xl mx-auto animate-in fade-in">
                <div className="flex justify-between items-center mb-8">
                    <span className="text-slate-400">Drill {drillCount + 1} / 5</span>
                    <div className="flex items-center space-x-2 text-primary-400">
                        <Trophy className="w-4 h-4" />
                        <span>{drillScore}</span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    <div className="text-center space-y-4">
                        {drillProblem.question ? (
                            <div className="text-2xl font-medium text-slate-100 leading-relaxed max-w-xl">
                                {drillProblem.question}
                            </div>
                        ) : (
                            <div className="text-6xl font-bold text-slate-100">
                                {drillProblem.num1} {drillProblem.operation} {drillProblem.num2}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleDrillSubmit} className="w-full max-w-xs space-y-4">
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className={`w-full bg-transparent border-b-4 text-center text-4xl py-4 focus:outline-none transition-colors ${feedback
                                ? feedback === 'Correct!' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'
                                : 'border-slate-600 text-slate-100 focus:border-primary-500'
                                }`}
                            placeholder="?"
                            autoFocus
                        />

                        {feedback && (
                            <div className={`text-center font-bold ${feedback === 'Correct!' ? 'text-green-400' : 'text-red-400'}`}>
                                {feedback}
                            </div>
                        )}

                        {!feedback && (
                            <button
                                type="submit"
                                className="w-full py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-bold transition-colors"
                            >
                                Submit
                            </button>
                        )}
                    </form>
                </div>
            </div>
        );
    }

    if (stage === 'complete') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-slate-100 mb-2">Mission Accomplished</h2>
                <p className="text-slate-400 mb-8">You have completed the training for {activeProtocol?.title}.</p>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 w-full max-w-sm">
                    <div className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Drill Score</div>
                    <div className="text-4xl font-bold text-primary-400">{drillScore} / 5</div>
                </div>

                <button
                    onClick={() => setStage('list')}
                    className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors"
                >
                    Return to Manual
                </button>
            </div>
        );
    }

    return null;
};

export default LessonScreen;
