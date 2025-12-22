import { generateProblem, type Problem } from './ProblemGenerator';

export type ErrorType =
    | 'CARRYING_ERROR'
    | 'BORROWING_ERROR'
    | 'SIGN_ERROR'
    | 'OFF_BY_ONE'
    | 'CALCULATION_ERROR'
    | 'UNKNOWN';

interface DiagnosticPlan {
    id: string;
    type: string;
    difficulty: number;
    constraints: { min: number; max: number };
    skill: string;
}

const DIAGNOSTIC_PLAN: DiagnosticPlan[] = [
    { id: 'd1', type: 'addition', difficulty: 1, constraints: { min: 1, max: 10 }, skill: 'addition_basic' },
    { id: 'd2', type: 'addition', difficulty: 1, constraints: { min: 5, max: 15 }, skill: 'addition_basic' },
    { id: 'd3', type: 'addition', difficulty: 2, constraints: { min: 15, max: 25 }, skill: 'addition_carrying' },
    { id: 'd4', type: 'subtraction', difficulty: 1, constraints: { min: 1, max: 10 }, skill: 'subtraction_basic' },
    { id: 'd5', type: 'subtraction', difficulty: 2, constraints: { min: 20, max: 30 }, skill: 'subtraction_borrowing' },
    { id: 'd6', type: 'multiplication', difficulty: 2, constraints: { min: 2, max: 9 }, skill: 'multiplication_basic' },
    { id: 'd7', type: 'multiplication', difficulty: 2, constraints: { min: 3, max: 12 }, skill: 'multiplication_basic' },
];

export interface DiagnosticReport {
    recommendedLevel: number;
    weaknesses: string[];
    overallAccuracy: number;
    detailedStats: Record<string, { correct: number; total: number; totalTime: number }>;
}

export class DiagnosticEngine {
    private currentIndex: number = 0;
    private results: Record<string, { correct: number; total: number; totalTime: number }> = {};

    getNextProblem(): (Problem & { skillKey: string; isDiagnostic: boolean; progress: string }) | null {
        if (this.currentIndex >= DIAGNOSTIC_PLAN.length) {
            return null;
        }

        const plan = DIAGNOSTIC_PLAN[this.currentIndex];
        const problem = generateProblem(plan.type, plan.difficulty, plan.constraints);

        return {
            ...problem,
            skillKey: plan.skill,
            isDiagnostic: true,
            progress: `${this.currentIndex + 1}/${DIAGNOSTIC_PLAN.length}`,
        };
    }

    processResult(problem: Problem, userAnswer: string, timeTaken: number): { isCorrect: boolean; correctAnswer: number; isComplete: boolean; errorType?: ErrorType } {
        const isCorrect = parseInt(userAnswer) === problem.answer;
        const skill = (problem as any).skillKey;

        if (!this.results[skill]) {
            this.results[skill] = { correct: 0, total: 0, totalTime: 0 };
        }

        this.results[skill].total++;
        this.results[skill].totalTime += timeTaken;
        if (isCorrect) this.results[skill].correct++;

        this.currentIndex++;

        let errorType: ErrorType | undefined;
        if (!isCorrect) {
            errorType = this.analyzeError(problem, parseInt(userAnswer));
        }

        return {
            isCorrect,
            correctAnswer: Number(problem.answer),
            isComplete: this.currentIndex >= DIAGNOSTIC_PLAN.length,
            errorType
        };
    }

    private analyzeError(problem: Problem, userAnswer: number): ErrorType {
        const { num1, num2, operation, answer } = problem;
        const diff = Math.abs(Number(answer) - userAnswer);

        if (isNaN(userAnswer)) return 'UNKNOWN';

        if (diff === 1) return 'OFF_BY_ONE';

        if (operation === '+') {
            // Heuristic for carrying error: if ones digit is correct but tens is off by 1 (or 10 in value)
            if (diff === 10) return 'CARRYING_ERROR';
        }

        if (operation === '-') {
            // Borrowing error: often leads to a difference of 10 or specific digit patterns
            if (diff === 10 || diff === 2) return 'BORROWING_ERROR';
        }

        if (['×', 'x', '*', '÷', '/'].includes(operation)) {
            if (userAnswer === -Number(answer)) return 'SIGN_ERROR';
        }

        return 'CALCULATION_ERROR';
    }

    generateReport(): DiagnosticReport {
        let totalScore = 0;
        let totalProblems = 0;
        const weaknesses: string[] = [];

        Object.entries(this.results).forEach(([skill, stats]) => {
            totalScore += stats.correct;
            totalProblems += stats.total;
            const accuracy = stats.correct / stats.total;

            if (accuracy < 0.6) {
                weaknesses.push(skill);
            }
        });

        const overallAccuracy = totalProblems > 0 ? totalScore / totalProblems : 0;

        let recommendedLevel = 1;
        if (overallAccuracy > 0.9) recommendedLevel = 5;
        else if (overallAccuracy > 0.7) recommendedLevel = 2;

        return {
            recommendedLevel,
            weaknesses,
            overallAccuracy,
            detailedStats: this.results,
        };
    }
}
