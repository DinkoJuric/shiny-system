import { describe, it, expect } from 'vitest';
import { TutorEngine } from '../TutorEngine';
import type { Problem } from '../ProblemGenerator';

describe('TutorEngine', () => {
    // 1. Helper for creating problems
    const createProblem = (
        type: 'addition' | 'subtraction' | 'multiplication' | 'division',
        num1: number,
        num2: number,
        op: string,
        ans: number
    ): Problem => ({
        id: 'test', type, num1, num2, operation: op, answer: ans
    });

    it('should generate Left-to-Right steps for Addition (num2 >= 10)', () => {
        const problem = createProblem('addition', 40, 23, '+', 63);
        const guide = TutorEngine.generateGuide(problem, 'CALCULATION_ERROR');

        expect(guide.steps[0].text).toContain('Start with the first number');
        expect(guide.steps[1].text).toContain('Add the tens');
        expect(guide.steps[2].text).toContain('Add the remaining ones');
    });

    it('should generate Squaring 5s strategy', () => {
        const problem = createProblem('multiplication', 35, 35, '×', 1225);
        const guide = TutorEngine.generateGuide(problem, 'CALCULATION_ERROR');

        expect(guide.steps[0].text).toContain('square of a number ending in 5');
        expect(guide.steps[2].text).toContain('Multiply the first digit(s) by the next number');
    });

    it('should generate Multiply by 11 strategy', () => {
        const problem = createProblem('multiplication', 23, 11, '×', 253);
        const guide = TutorEngine.generateGuide(problem, 'CALCULATION_ERROR');

        expect(guide.steps[0].text).toContain('To multiply by 11, add the digits');
        expect(guide.steps[1].text).toContain('Put the sum in the middle');
    });

    it('should generate Multiply by 5 strategy', () => {
        const problem = createProblem('multiplication', 14, 5, '×', 70);
        const guide = TutorEngine.generateGuide(problem, 'CALCULATION_ERROR');

        expect(guide.steps[0].text).toContain('halving, then multiplying by 10');
        expect(guide.steps[1].text).toContain('halve the number');
    });

    it('should generate Divide by 5 strategy', () => {
        const problem = createProblem('division', 240, 5, '÷', 48);
        const guide = TutorEngine.generateGuide(problem, 'CALCULATION_ERROR');

        expect(guide.steps[0].text).toContain('doubling, then dividing by 10');
        expect(guide.steps[1].text).toContain('Double the number');
    });

    it('should generate Complementary Numbers strategy for subtraction', () => {
        const problem = createProblem('subtraction', 1000, 357, '-', 643);
        const guide = TutorEngine.generateGuide(problem, 'CALCULATION_ERROR');

        expect(guide.steps[0].text).toContain('All from 9, last from 10');
        expect(guide.steps[1].text).toContain('Subtract every digit');
    });

    it('should generate Doubling and Halving strategy for multiplication', () => {
        const problem = createProblem('multiplication', 14, 16, '×', 224);
        const guide = TutorEngine.generateGuide(problem, 'CALCULATION_ERROR');

        expect(guide.steps[0].text).toContain('doubling and halving');
        expect(guide.steps[1].text).toContain('Halve 14');
    });

    it('should fallback to Breakdown for other multiplication', () => {
        const problem = createProblem('multiplication', 23, 14, '×', 322);
        const guide = TutorEngine.generateGuide(problem, 'CALCULATION_ERROR');

        expect(guide.steps[0].text).toContain('Split 14 into 10 and 4');
    });
});
