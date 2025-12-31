import { describe, it, expect, beforeEach } from 'vitest';
import { TutorEngine } from '../TutorEngine';
import { DiagnosticEngine } from '../DiagnosticEngine';
import type { Problem } from '../ProblemGenerator';

describe('TutorEngine', () => {
    let tutorEngine: TutorEngine;
    let mockDiagnostic: DiagnosticEngine;

    beforeEach(() => {
        mockDiagnostic = new DiagnosticEngine();
        tutorEngine = new TutorEngine(mockDiagnostic);
    });

    const createProblem = (id: string): Problem => ({
        id, type: 'addition', num1: 10, num2: 5, operation: '+', answer: 15
    });

    it('should not show breakdown on correct answer', () => {
        const problem = createProblem('p1');
        tutorEngine.resetForNewProblem(problem);

        const state = tutorEngine.handleAttempt(problem, true);
        expect(state.shouldShowBreakdown).toBe(false);
    });

    it('should not show breakdown on first wrong attempt', () => {
        const problem = createProblem('p1');
        tutorEngine.resetForNewProblem(problem);

        const state = tutorEngine.handleAttempt(problem, false);
        expect(state.shouldShowBreakdown).toBe(false);
    });

    it('should triggers breakdown after 2 wrong attempts', () => {
        const problem = createProblem('p1');
        tutorEngine.resetForNewProblem(problem);

        // Attempt 1 (Wrong)
        tutorEngine.handleAttempt(problem, false);

        // Attempt 2 (Wrong)
        const state = tutorEngine.handleAttempt(problem, false);

        expect(state.shouldShowBreakdown).toBe(true);
        expect(state.solutionSteps.length).toBeGreaterThan(0);
    });

    it('should reset wrong attempts for new problem', () => {
        const p1 = createProblem('p1');
        tutorEngine.resetForNewProblem(p1);
        tutorEngine.handleAttempt(p1, false); // 1 wrong

        const p2 = createProblem('p2');
        tutorEngine.resetForNewProblem(p2);
        const state = tutorEngine.handleAttempt(p2, false); // 1 wrong on p2

        // Should NOT trigger because count was reset
        expect(state.shouldShowBreakdown).toBe(false);
    });
});
