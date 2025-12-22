import { describe, it, expect, beforeEach } from 'vitest';
import { DiagnosticEngine } from '../DiagnosticEngine';
import { Problem } from '../ProblemGenerator';

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
});
