import { useState, useEffect, useRef } from 'react';
import { AdaptiveEngine } from '../engine/AdaptiveEngine';
import { useStore } from '../store';
import { ArrowRight, SkipForward, CheckCircle } from 'lucide-react';
import type { Problem } from '../engine/ProblemGenerator';

interface DeepDiagnosticScreenProps {
    onComplete: (report: { recommendedLevel: number; skillProficiency: Record<string, number> }) => void;
}

const DeepDiagnosticScreen = ({ onComplete }: DeepDiagnosticScreenProps) => {
    const { userProfile } = useStore();
    const [engine] = useState(() => new AdaptiveEngine(userProfile));
    const [currentStage, setCurrentStage] = useState(1);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [stageBatch, setStageBatch] = useState<Array<Problem & { skillKey: string }>>([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [results, setResults] = useState<Array<{ skillKey: string; isCorrect: boolean; timeTaken: number }>>([]);
    const [startTime, setStartTime] = useState(Date.now());
    const [isComplete, setIsComplete] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadStage(1);
    }, []);

    const loadStage = (stage: number) => {
        const batch = engine.generateDiagnosticBatch(stage);
        setStageBatch(batch);
        setCurrentQuestionIndex(0);
        setStartTime(Date.now());
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const currentProblem = stageBatch[currentQuestionIndex];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        processAnswer(userAnswer);
    };

    const handleSkip = () => {
        processAnswer(''); // Empty answer = incorrect
    };

    const processAnswer = (answer: string) => {
        if (!currentProblem) return;

        const timeTaken = (Date.now() - startTime) / 1000;
        const isCorrect = answer.trim() === currentProblem.answer.toString();

        const newResults = [...results, {
            skillKey: currentProblem.skillKey,
            isCorrect,
            timeTaken
        }];
        setResults(newResults);

        // Move to next question or stage
        if (currentQuestionIndex < stageBatch.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setUserAnswer('');
            setStartTime(Date.now());
            inputRef.current?.focus();
        } else {
            // Stage complete - check if we should continue
            const stageResults = newResults.slice(-3); // Last 3 results (current stage)
            const stageAccuracy = (stageResults.filter(r => r.isCorrect).length / stageResults.length) * 100;

            if (stageAccuracy < 66 || currentStage === 4) {
                // Stop and finalize
                finalizeAssessment(newResults);
            } else {
                // Continue to next stage
                setCurrentStage(currentStage + 1);
                loadStage(currentStage + 1);
                setUserAnswer('');
            }
        }
    };

    const finalizeAssessment = (finalResults: Array<{ skillKey: string; isCorrect: boolean; timeTaken: number }>) => {
        const report = engine.evaluateDiagnostic(finalResults);
        setIsComplete(true);
        setTimeout(() => onComplete(report), 1500);
    };

    if (isComplete) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in">
                <CheckCircle className="w-20 h-20 text-green-400 mb-4" />
                <h2 className="text-3xl font-bold text-slate-200">Assessment Complete!</h2>
                <p className="text-slate-400 mt-2">Preparing your personalized training...</p>
            </div>
        );
    }

    if (!currentProblem) {
        return <div className="text-white">Loading...</div>;
    }

    const totalQuestions = results.length + (stageBatch.length - currentQuestionIndex);
    const progress = (results.length / totalQuestions) * 100;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto animate-in">
            {/* Progress Header */}
            <div className="w-full mb-8">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Stage {currentStage} of 4</span>
                    <span>{results.length} questions answered</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Problem Display */}
            <div className="mb-6 text-center space-y-2">
                <div className="text-6xl md:text-8xl font-bold text-slate-100 tracking-tight">
                    {currentProblem.num1} {currentProblem.operation} {currentProblem.num2}
                </div>
                <div className="text-2xl text-slate-500 font-light">= ?</div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="w-full max-w-xs">
                <input
                    ref={inputRef}
                    type="text"
                    inputMode={currentProblem.type.includes('fraction') ? 'text' : 'numeric'}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full bg-transparent border-b-4 border-slate-600 focus:border-primary-500 text-center text-4xl py-4 focus:outline-none transition-colors duration-300 placeholder-slate-700 text-slate-100"
                    placeholder={currentProblem.type.includes('fraction') ? 'a/b' : '#'}
                    autoFocus
                    autoComplete="off"
                />

                <div className="flex gap-2 mt-6">
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        <SkipForward className="w-5 h-5" />
                        <span>Skip</span>
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        <span>Submit</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DeepDiagnosticScreen;
