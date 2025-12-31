import { describe, it, expect, beforeEach } from 'vitest';
import { DiagnosticEngine } from '../DiagnosticEngine';
import type { Problem } from '../ProblemGenerator';

describe('DiagnosticEngine', () => {
    let engine: DiagnosticEngine;

    beforeEach(() => {
        engine = new DiagnosticEngine();
    });

    it('should identify CARRYING_ERROR', () => {
        const problem: Problem = {
            id: 'test', type: 'addition', num1: 15, num2: 5, operation: '+', answer: 20
        };
        // User answers 10 (forgot to carry the 1 from 5+5=10) -> Diff is 10
        const result = engine.processResult(problem, '10', 1);
        expect(result.isCorrect).toBe(false);
        expect(result.errorType).toBe('CARRYING_ERROR');
    });

    it('should identify BORROWING_ERROR', () => {
        const problem: Problem = {
            id: 'test', type: 'subtraction', num1: 22, num2: 8, operation: '-', answer: 14
        };
        // User answers 24 (Did 8-2 instead of borrowing?) - Wait, 22-8=14. 
        // If user does 2-8 as 8-2 -> 26? Diff is 12.
        // If user forgets to borrow: 12-8=4, but keeps the 2? -> 24. Diff is 10.
        const result = engine.processResult(problem, '24', 1);
        expect(result.isCorrect).toBe(false);
        expect(result.errorType).toBe('BORROWING_ERROR');
    });

    it('should identify SIGN_ERROR', () => {
        const problem: Problem = {
            id: 'test', type: 'multiplication', num1: -5, num2: 5, operation: 'x', answer: -25
        };
        const result = engine.processResult(problem, '25', 1);
        expect(result.isCorrect).toBe(false);
        expect(result.errorType).toBe('SIGN_ERROR');
    });

    it('should identify OFF_BY_ONE', () => {
        const problem: Problem = {
            id: 'test', type: 'addition', num1: 5, num2: 2, operation: '+', answer: 7
        };
        const result = engine.processResult(problem, '6', 1);
        expect(result.isCorrect).toBe(false);
        expect(result.errorType).toBe('OFF_BY_ONE');
    });

    it('should return CALCULATION_ERROR for random wrong answers', () => {
        const problem: Problem = {
            id: 'test', type: 'addition', num1: 5, num2: 2, operation: '+', answer: 7
        };
        const result = engine.processResult(problem, '20', 1);
        expect(result.isCorrect).toBe(false);
        expect(result.errorType).toBe('CALCULATION_ERROR');
    });

    describe('generateSolutionSteps', () => {
        it('should generate steps for simple addition', () => {
            const problem: Problem = { id: 't1', type: 'addition', num1: 15, num2: 4, operation: '+', answer: 19 };
            const steps = engine.generateSolutionSteps(problem);
            expect(steps.length).toBeGreaterThan(0);
            expect(steps[0]).toContain('Start with 15');
        });

        it('should generate decomposition steps for larger addition', () => {
            const problem: Problem = { id: 't2', type: 'addition', num1: 25, num2: 12, operation: '+', answer: 37 };
            const steps = engine.generateSolutionSteps(problem);
            // Expecting breakdown of 12 -> 10 + 2
            expect(steps.some(s => s.includes('Split 12'))).toBe(true);
        });

        it('should generate steps for simple subtraction', () => {
            const problem: Problem = { id: 't3', type: 'subtraction', num1: 25, num2: 4, operation: '-', answer: 21 };
            const steps = engine.generateSolutionSteps(problem);
            expect(steps.some(s => s.includes('25 - 4'))).toBe(true);
        });

        it('should generate breakdown steps for multiplication', () => {
            const problem: Problem = { id: 't4', type: 'multiplication', num1: 15, num2: 12, operation: '×', answer: 180 };
            const steps = engine.generateSolutionSteps(problem);
            expect(steps.some(s => s.includes('Split 12'))).toBe(true);
        });
    });
});
