import { describe, it, expect } from 'vitest';
import { AdaptiveEngine, MICRO_SKILLS } from '../AdaptiveEngine';
import { generateProblem } from '../ProblemGenerator';

describe('Phase 4 Refinement', () => {
    const mockProfile = {
        name: 'Test',
        level: 5,
        xp: 1000,
        stats: {},
        skillProficiency: {},
        hasCompletedDiagnostic: false,
        currentStreak: 0,
        longestStreak: 0,
        sessionHistory: [],
        autoPilotEnabled: false
    };
    const engine = new AdaptiveEngine(mockProfile);

    describe('New Micro-Skills', () => {
        it('should generate multiplication by 11 problems', () => {
            const config = MICRO_SKILLS['mult_by_11'];
            const problem = generateProblem(config.type, 5, { min: config.min, max: config.max });
            expect(problem.type).toBe('multiplication');
            expect(Number(problem.num1)).toBeGreaterThanOrEqual(11);
            expect(Number(problem.num2)).toBeGreaterThanOrEqual(11);
        });

        it('should generate percentage 10/50 problems', () => {
            const config = MICRO_SKILLS['perc_10_50'];
            const problem = generateProblem(config.type, 5, { min: config.min, max: config.max });
            expect(problem.type).toBe('percentage_basic');
            // num1 is the percentage string "10%". Parse it.
            const percentVal = parseInt(problem.num1 as string);
            expect(percentVal).toBeGreaterThanOrEqual(10);
            expect(percentVal).toBeLessThanOrEqual(50);
        });
    });

    describe('Improved Hints', () => {
        it('should give 11s trick hint for x11', () => {
            const problem: any = {
                id: '1',
                type: 'multiplication',
                num1: 23,
                num2: 11,
                answer: 253,
                question: '23 x 11'
            };
            const hint = engine.getStrategyHint(problem);
            expect(hint.text).toContain('11s Trick');
            expect(hint.text).toContain('Split digits');
        });

        it('should give compensation hint for near 100 addition', () => {
            const problem: any = {
                id: '2',
                type: 'addition',
                num1: 98,
                num2: 45,
                answer: 143,
                question: '98 + 45'
            };
            const hint = engine.getStrategyHint(problem);
            expect(hint.text).toContain('Compensation');
            expect(hint.text).toContain('close to 100');
        });

        it('should give percentage specific hints', () => {
            const problem: any = {
                id: '3',
                type: 'percentage_basic',
                num1: 50,
                num2: 80,
                answer: 40,
                question: '50% of 80'
            };
            const hint = engine.getStrategyHint(problem);
            expect(hint.text).toContain('50%');
            expect(hint.text).toContain('cut the number in half');
        });
    });
});
