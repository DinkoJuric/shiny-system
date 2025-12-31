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

        // Carrying error detection (Addition)
        if (operation === '+') {
            const lastDigit1 = num1 % 10;
            const lastDigit2 = num2 % 10;
            // If they just summed the digits without carrying (e.g. 15+9 -> 5+9=14, write 4, 1+0=1 -> 14... wait. 
            // Classic carrying error: 15+5 = 10 (forgot the 10) or 19 (forgot to add carried 1).
            // A common heuristic: result is exactly 10 less than answer
            if (diff === 10) return 'CARRYING_ERROR';
        }

        // Borrowing error detection (Subtraction)
        if (operation === '-') {
            // Common borrowing error: 25 - 9. 5-9 -> "9-5=4", 2-0=2 -> 24. (Answer is 16). Diff is 8.
            // Another: 32 - 15. 2-5 -> "5-2=3", 3-1=2 -> 23. (Answer is 17). Diff is 6.
            // Heuristic: If the ones digit of the user answer is the absolute difference of the ones digits (reversed subtraction)
            const ansOnes = Number(answer) % 10;
            const userOnes = userAnswer % 10;
            // complex to detect perfectly without more granular state, but diff=10 is a strong signal for "forgot to borrow check"
            if (diff === 10) return 'BORROWING_ERROR';
        }

        if (['×', 'x', '*', '÷', '/'].includes(operation)) {
            if (userAnswer === -Number(answer)) return 'SIGN_ERROR';
        }

        return 'CALCULATION_ERROR';
    }

    generateSolutionSteps(problem: Problem): string[] {
        const { num1, num2, operation } = problem;
        const steps: string[] = [];

        if (operation === '+') {
            // Strategy: Split by place value
            if (num2 < 10) {
                steps.push(`Start with ${num1}.`);
                const distanceToTen = 10 - (num1 % 10);
                if (num1 % 10 !== 0 && num2 > distanceToTen) {
                    steps.push(`Add ${distanceToTen} to make ${num1 + distanceToTen}.`);
                    steps.push(`You have ${num2 - distanceToTen} left to add.`);
                    steps.push(`${num1 + distanceToTen} + ${num2 - distanceToTen} = ${num1 + num2}`);
                } else {
                    steps.push(`${num1} + ${num2} = ${num1 + num2}`);
                }
            } else {
                steps.push(`Split ${num2} into tens and ones: ${Math.floor(num2 / 10) * 10} + ${num2 % 10}`);
                steps.push(`${num1} + ${Math.floor(num2 / 10) * 10} = ${num1 + Math.floor(num2 / 10) * 10}`);
                steps.push(`Now add the ones: ${num1 + Math.floor(num2 / 10) * 10} + ${num2 % 10} = ${num1 + num2}`);
            }
        } else if (operation === '-') {
            // Strategy: Subtract to nearest ten
            const ones = num1 % 10;
            if (num2 < 10 && ones < num2) {
                steps.push(`Split ${num2} into ${ones} and ${num2 - ones}.`);
                steps.push(`${num1} - ${ones} = ${num1 - ones}`);
                steps.push(`${num1 - ones} - ${num2 - ones} = ${num1 - num2}`);
            } else {
                steps.push(`${num1} - ${num2} = ${num1 - num2}`);
            }
        } else if (operation === '*' || operation === '×' || operation === 'x') {
            // Strategy: Break down standard multiplication
            if (num2 > 10) {
                const tens = Math.floor(num2 / 10) * 10;
                const ones = num2 % 10;
                steps.push(`Split ${num2} into ${tens} + ${ones}.`);
                steps.push(`${num1} × ${tens} = ${num1 * tens}`);
                steps.push(`${num1} × ${ones} = ${num1 * ones}`);
                steps.push(`Add them together: ${num1 * tens} + ${num1 * ones} = ${num1 * num2}`);
            } else {
                steps.push(`${num1} × ${num2} = ${num1 * num2}`);
            }
        } else if (operation === '√') {
            // Strategy: Nearest Square
            const num = Number(num1);
            const ans = Number(problem.answer);
            if (ans * ans === num) {
                steps.push(`Find the number that multiplied by itself equals ${num}.`);
                // Check nearby squares to give context
                const lower = (ans - 1) * (ans - 1);
                const higher = (ans + 1) * (ans + 1);
                steps.push(`We know ${ans - 1}² = ${lower} and ${ans + 1}² = ${higher}.`);
                steps.push(`Since ${ans} × ${ans} = ${num}, the answer is ${ans}.`);
            } else {
                steps.push(`Estimate the root of ${num}.`);
                steps.push(`It is between ${Math.floor(ans)} and ${Math.ceil(ans)}.`);
            }
        } else if (problem.type === 'percentage_basic') {
            // Strategy: 10% and 1%
            // num1 is "20%", num2 is 50.
            const percentStr = String(num1).replace('%', '');
            const percent = Number(percentStr);
            const base = Number(num2);

            steps.push(`Find ${percent}% of ${base}.`);

            if (percent % 10 === 0) {
                const tenPercent = base / 10;
                steps.push(`First, find 10% by moving the decimal one spot left.`);
                steps.push(`10% of ${base} is ${tenPercent}.`);
                const multiplier = percent / 10;
                if (multiplier !== 1) {
                    steps.push(`We need ${percent}%, so multiply by ${multiplier}.`);
                    steps.push(`${tenPercent} × ${multiplier} = ${tenPercent * multiplier}.`);
                }
            } else if (percent === 25) {
                steps.push(`25% is the same as 1/4.`);
                steps.push(`Divide ${base} by 4.`);
                steps.push(`${base} ÷ 4 = ${base / 4}.`);
            } else if (percent === 50) {
                steps.push(`50% is exactly half.`);
                steps.push(`${base} ÷ 2 = ${base / 2}.`);
            } else {
                // 1% method
                const onePercent = base / 100;
                steps.push(`Find 1% by moving the decimal two spots left: ${onePercent}.`);
                steps.push(`Multiply by ${percent}.`);
                steps.push(`${onePercent} × ${percent} = ${onePercent * percent}.`);
            }
        } else {
            steps.push(`${num1} ${operation} ${num2} = ${problem.answer}`);
        }

        return steps;
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
