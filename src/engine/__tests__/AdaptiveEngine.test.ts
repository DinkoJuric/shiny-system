import { describe, it, expect, beforeEach } from 'vitest';
import { AdaptiveEngine } from '../AdaptiveEngine';
import { type UserProfile } from '../../store';

describe('AdaptiveEngine', () => {
    let engine: AdaptiveEngine;
    let mockProfile: UserProfile;

    beforeEach(() => {
        mockProfile = {
            name: 'Test User',
            level: 1,
            xp: 0,
            stats: {},
            skillProficiency: {},
            hasCompletedDiagnostic: false,
            currentStreak: 0,
            longestStreak: 0,
            sessionHistory: [],
            autoPilotEnabled: false
        };
        engine = new AdaptiveEngine(mockProfile);
    });

    it('should initialize correctly', () => {
        expect(engine).toBeDefined();
    });

    it('should return a problem with a skillKey', () => {
        const problem = engine.getNextProblem();
        expect(problem).toBeDefined();
        expect(problem.skillKey).toBeDefined();
    });

    it('should update proficiency on correct answer', () => {
        const problem = engine.getNextProblem();
        const result = engine.processResult(problem, problem.answer.toString(), 2); // Fast answer

        expect(result.isCorrect).toBe(true);
        expect(result.proficiencyDelta).toBeGreaterThan(0);
    });

    it('should penalize proficiency on incorrect answer', () => {
        const problem = engine.getNextProblem();
        const result = engine.processResult(problem, '999999', 5); // Wrong answer

        expect(result.isCorrect).toBe(false);
        expect(result.proficiencyDelta).toBeLessThan(0);
    });

    it('should generate feedback', () => {
        const problem = engine.getNextProblem();
        const result = engine.processResult(problem, problem.answer.toString(), 1);
        expect(result.feedback).toBeDefined();
        expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should NOT generate word problems in standard mode', () => {
        // Run multiple times to ensure no random word problems appear
        for (let i = 0; i < 20; i++) {
            const problem = engine.getNextProblem();
            expect(problem.question).toBeUndefined();
            expect(problem.isWordProblem).toBeFalsy();
        }
    });

    it('should generate word problems when requested via getLessonProblem', () => {
        // Force a word problem
        const problem = engine.getLessonProblem('addition_basic', true);
        expect(problem.question).toBeDefined();
        expect(problem.isWordProblem).toBe(true);
    });

    it('should return a structured hint object', () => {
        const problem = engine.getNextProblem();
        const hint = engine.getStrategyHint(problem);
        expect(hint).toBeDefined();
        expect(hint.text).toBeDefined();
        expect(typeof hint.text).toBe('string');
    });
});
