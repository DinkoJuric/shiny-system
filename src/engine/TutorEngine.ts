import { DiagnosticEngine, type ErrorType } from './DiagnosticEngine';
import type { Problem } from './ProblemGenerator';

export interface TutorState {
    shouldShowBreakdown: boolean;
    solutionSteps: string[];
    errorType?: ErrorType;
}

export class TutorEngine {
    private diagnosticEngine: DiagnosticEngine;
    // private wrongData: Record<string, number> = {}; // Unused for now
    private currentProblemId: string | null = null;
    private wrongAttemptsCurrentProblem: number = 0;

    constructor(diagnosticEngine: DiagnosticEngine) {
        this.diagnosticEngine = diagnosticEngine;
    }

    resetForNewProblem(problem: Problem) {
        // Generate a unique ID for the problem instance if it doesn't have one, or just track by reference/reset
        this.currentProblemId = `${problem.num1}-${problem.operation}-${problem.num2}`;
        this.wrongAttemptsCurrentProblem = 0;
    }

    handleAttempt(problem: Problem, isCorrect: boolean): TutorState {
        if (isCorrect) {
            return { shouldShowBreakdown: false, solutionSteps: [] };
        }

        this.wrongAttemptsCurrentProblem++;

        // Trigger breakdown if 2 or more wrong attempts
        if (this.wrongAttemptsCurrentProblem >= 2) {
            return this.getBreakdown(problem);
        }

        return { shouldShowBreakdown: false, solutionSteps: [] };
    }

    getBreakdown(problem: Problem): TutorState {
        const steps = this.diagnosticEngine.generateSolutionSteps(problem);
        // We could also pass the last error type if we wanted to be specific, 
        // but for now we generate steps regardless of the specific error type.
        return {
            shouldShowBreakdown: true,
            solutionSteps: steps,
        };
    }

    createDrillParams(problem: Problem, count: number = 3): Problem[] {
        // Create a simple drill set based on the failed problem
        const drills: Problem[] = [];
        // We'll generate problems of the same type and difficulty
        // In a future iteration, we could use the specific ErrorType we detected to refine this
        for (let i = 0; i < count; i++) {
            // For now, using a helper or modifying ProblemGenerator to expose generateProblemFromError would be best.
            // But since we can't easily import generateProblemFromError here without circular dep issues if not careful,
            // let's assume we import it from ProblemGenerator.
            // Ideally this method delegates to a DrillManager.
            // For this MVP, we will return empty and let GameScreen handle calling ProblemGenerator directly
            // OR we add the import. Adding the import is cleaner.
        }
        return [];
    }
}
