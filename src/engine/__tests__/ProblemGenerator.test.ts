import { describe, it, expect } from 'vitest';
import { generateProblem } from '../ProblemGenerator';

describe('ProblemGenerator', () => {
    describe('Addition', () => {
        it('should generate basic addition problems within range', () => {
            const problem = generateProblem('addition', 1, { min: 1, max: 10 });
            expect(problem.type).toBe('addition');
            expect(problem.operation).toBe('+');
            expect(typeof problem.num1).toBe('number');
            expect(typeof problem.num2).toBe('number');
            expect((problem.num1 as number)).toBeGreaterThanOrEqual(1);
            expect((problem.num1 as number)).toBeLessThanOrEqual(10);
            expect((problem.num2 as number)).toBeGreaterThanOrEqual(1);
            expect((problem.num2 as number)).toBeLessThanOrEqual(10);
            expect(problem.answer).toBe((problem.num1 as number) + (problem.num2 as number));
        });
    });

    describe('Multiplication', () => {
        it('should generate multiplication problems', () => {
            const problem = generateProblem('multiplication', 2, { min: 2, max: 9 });
            expect(problem.type).toBe('multiplication');
            expect(problem.operation).toBe('×');
            expect(problem.answer).toBe((problem.num1 as number) * (problem.num2 as number));
        });
    });

    describe('Fractions', () => {
        it('should generate fraction simplification problems', () => {
            const problem = generateProblem('fraction_simplification', 1);
            expect(problem.type).toBe('fraction_simplification');
            expect(typeof problem.num1).toBe('string');
            expect(problem.num1.toString()).toContain('/');
        });

        it('should generate fraction addition problems', () => {
            const problem = generateProblem('fraction_addition', 1);
            expect(problem.type).toBe('fraction_addition');
            expect(problem.operation).toBe('+');
            expect(typeof problem.num1).toBe('string');
            expect(typeof problem.num2).toBe('string');
        });
    });

    describe('Percentages', () => {
        it('should generate percentage problems', () => {
            const problem = generateProblem('percentage_basic', 1);
            expect(problem.type).toBe('percentage_basic');
            expect(problem.operation).toBe('of');
            expect(typeof problem.num1).toBe('string');
            expect(problem.num1.toString()).toContain('%');
        });
    });
});
