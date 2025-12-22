import { generateProblem, type Problem } from './ProblemGenerator';
import type { UserProfile } from '../store';
import { MENTAL_MATH_MANUAL, getAdvancedHint } from './MentalMathHints';
import type { Hint } from './MentalMathHints';
import { convertToWordProblem } from './WordProblemGenerator';
import { logger } from '../utils/logger';
import { Persona } from './Persona';

interface MicroSkillConfig {
    type: string;
    min: number;
    max: number;
    correctAnswer?: number | string;
    feedback?: string;
    strategyHint?: string;
    proficiencyDelta?: number;
    skillKey?: string;
}

export interface VisualHintStep {
    label?: string;
    value: string;
    operation?: string;
    highlight?: boolean;
}

export interface ProblemResult {
    isCorrect: boolean;
    streak: number;
    correctAnswer: number | string;
    feedback: string;
    strategyHint?: Hint;
    proficiencyDelta?: number;
    skillKey?: string;
}

export const MICRO_SKILLS: Record<string, MicroSkillConfig> = {
    // Addition
    addition_basic: { type: 'addition', min: 1, max: 10, correctAnswer: 0, feedback: '' }, // Fallback
    add_basic_10: { type: 'addition', min: 1, max: 10, correctAnswer: 0, feedback: '' },
    add_no_carry_20: { type: 'addition', min: 10, max: 20, correctAnswer: 0, feedback: '' },
    add_carry_20: { type: 'addition', min: 10, max: 20, correctAnswer: 0, feedback: '' },
    add_tens: { type: 'addition', min: 10, max: 90, correctAnswer: 0, feedback: '' }, // NEW
    add_near_100: { type: 'addition', min: 90, max: 99, correctAnswer: 0, feedback: '' }, // NEW
    add_double_100: { type: 'addition', min: 20, max: 100, correctAnswer: 0, feedback: '' },

    // Subtraction
    subtraction_basic: { type: 'subtraction', min: 1, max: 10, correctAnswer: 0, feedback: '' }, // Fallback
    sub_basic_10: { type: 'subtraction', min: 1, max: 10, correctAnswer: 0, feedback: '' },
    sub_no_borrow_20: { type: 'subtraction', min: 10, max: 20, correctAnswer: 0, feedback: '' },
    sub_borrow_20: { type: 'subtraction', min: 10, max: 20, correctAnswer: 0, feedback: '' },
    sub_near_100: { type: 'subtraction', min: 90, max: 100, correctAnswer: 0, feedback: '' }, // NEW
    sub_double_100: { type: 'subtraction', min: 20, max: 100, correctAnswer: 0, feedback: '' },

    // Multiplication
    multiplication_basic: { type: 'multiplication', min: 1, max: 10, correctAnswer: 0, feedback: '' }, // Fallback
    mult_tables_5: { type: 'multiplication', min: 1, max: 5, correctAnswer: 0, feedback: '' },
    mult_tables_9: { type: 'multiplication', min: 2, max: 9, correctAnswer: 0, feedback: '' },
    mult_tables_12: { type: 'multiplication', min: 2, max: 12, correctAnswer: 0, feedback: '' },
    mult_by_11: { type: 'multiplication', min: 11, max: 99, correctAnswer: 0, feedback: '' }, // NEW
    mult_double_single: { type: 'multiplication', min: 10, max: 20, correctAnswer: 0, feedback: '' },

    // Division
    division_basic: { type: 'division', min: 1, max: 10, correctAnswer: 0, feedback: '' }, // Fallback
    div_basic_tables: { type: 'division', min: 1, max: 10, correctAnswer: 0, feedback: '' },

    // Fractions
    fraction_simplification: { type: 'fraction_simplification', min: 1, max: 10, correctAnswer: 0, feedback: '' },
    fraction_addition: { type: 'fraction_addition', min: 1, max: 10, correctAnswer: 0, feedback: '' },
    frac_identify: { type: 'fraction_simplification', min: 1, max: 50, correctAnswer: 0, feedback: '' },
    frac_add_common: { type: 'fraction_addition', min: 1, max: 50, correctAnswer: 0, feedback: '' },

    // Percentages
    percentage_basic: { type: 'percentage_basic', min: 1, max: 100, correctAnswer: 0, feedback: '' },
    perc_10: { type: 'percentage_basic', min: 10, max: 10, correctAnswer: 0, feedback: '' }, // NEW
    perc_25: { type: 'percentage_basic', min: 25, max: 25, correctAnswer: 0, feedback: '' }, // NEW
    perc_50: { type: 'percentage_basic', min: 50, max: 50, correctAnswer: 0, feedback: '' }, // NEW
    perc_10_50: { type: 'percentage_basic', min: 10, max: 50, correctAnswer: 0, feedback: '' },

    // Decimals
    decimal_basic: { type: 'decimal_basic', min: 1, max: 10, correctAnswer: 0, feedback: '' },
    dec_add_simple: { type: 'decimal_basic', min: 10, max: 100, correctAnswer: 0, feedback: '' },

    // Powers & Roots
    powers_basic: { type: 'powers_basic', min: 1, max: 10, correctAnswer: 0, feedback: '' },
    roots_basic: { type: 'roots_basic', min: 1, max: 10, correctAnswer: 0, feedback: '' },
    pow_squares_10: { type: 'powers_basic', min: 1, max: 10, correctAnswer: 0, feedback: '' },
    pow_squares_end5: { type: 'powers_basic', min: 15, max: 95, correctAnswer: 0, feedback: '' }, // NEW
    root_perfect_100: { type: 'roots_basic', min: 10, max: 50, correctAnswer: 0, feedback: '' },
};

export class AdaptiveEngine {
    private userProfile: UserProfile;
    private currentStreak: number = 0;
    private sessionHistory: any[] = [];

    constructor(userProfile: UserProfile) {
        this.userProfile = userProfile;
    }

    // Deep Diagnostic Methods
    generateDiagnosticBatch(stage: number): Array<Problem & { skillKey: string }> {
        const stageBatches: Record<number, string[]> = {
            1: ['add_basic_10', 'sub_basic_10', 'add_carry_20'],
            2: ['mult_tables_5', 'mult_tables_9', 'div_basic_tables'],
            3: ['fraction_simplification', 'decimal_basic', 'percentage_basic'],
            4: ['powers_basic', 'roots_basic', 'add_double_100']
        };

        const skills = stageBatches[stage] || stageBatches[1];
        return skills.map(skillKey => {
            const config = MICRO_SKILLS[skillKey];
            return {
                ...generateProblem(config.type, 1, { min: config.min, max: config.max }),
                skillKey
            };
        });
    }

    evaluateDiagnostic(results: Array<{ skillKey: string; isCorrect: boolean; timeTaken: number }>): {
        recommendedLevel: number;
        skillProficiency: Record<string, number>;
    } {
        const skillProficiency: Record<string, number> = {};

        // Calculate proficiency for each skill
        results.forEach(result => {
            if (result.isCorrect) {
                // Fast correct = high proficiency
                if (result.timeTaken < 5) skillProficiency[result.skillKey] = 80;
                else if (result.timeTaken < 10) skillProficiency[result.skillKey] = 60;
                else skillProficiency[result.skillKey] = 40;
            } else {
                skillProficiency[result.skillKey] = 20;
            }
        });

        // Calculate overall accuracy
        const correctCount = results.filter(r => r.isCorrect).length;
        const accuracy = results.length > 0 ? (correctCount / results.length) * 100 : 0;

        // Determine recommended level based on accuracy
        let recommendedLevel = 1;
        if (accuracy >= 90) recommendedLevel = 7;
        else if (accuracy >= 75) recommendedLevel = 5;
        else if (accuracy >= 60) recommendedLevel = 3;
        else if (accuracy >= 40) recommendedLevel = 2;

        return { recommendedLevel, skillProficiency };
    }

    getNextProblem(): Problem & { skillKey: string } {
        const level = this.userProfile.level || 1;

        // Determine eligible skills based on User Level
        let eligibleSkills = this.getEligibleSkills(level);

        // Apply custom training plan if active
        if (this.userProfile.activePlan && this.userProfile.activePlan.targetSkills.length > 0) {
            // Filter eligible skills to only those in the training plan
            const planSkills = this.userProfile.activePlan.targetSkills.filter(
                skill => eligibleSkills.includes(skill)
            );
            if (planSkills.length > 0) {
                eligibleSkills = planSkills;
            }
        }

        // Select skill based on "Spaced Repetition" / Proficiency
        // Prioritize skills with lower proficiency (< 80%)
        // Occasionally review mastered skills (20% chance)
        let selectedSkillKey = eligibleSkills[0];

        const weakSkills = eligibleSkills.filter(key => (this.userProfile.skillProficiency?.[key] || 0) < 80);

        if (weakSkills.length > 0 && Math.random() > 0.2) {
            // 80% chance to work on a weak skill
            selectedSkillKey = weakSkills[Math.floor(Math.random() * weakSkills.length)];
        } else {
            // 20% chance to pick any eligible skill (review or maintenance)
            selectedSkillKey = eligibleSkills[Math.floor(Math.random() * eligibleSkills.length)];
        }

        const skillConfig = MICRO_SKILLS[selectedSkillKey];

        // Dynamic difficulty scaling (apply to skill ranges)
        let dynamicMax = skillConfig.max;
        if (selectedSkillKey.includes('double')) {
            // Scale max for "double" skills
            dynamicMax = Math.min(100, 20 + (level * 30));
        }

        return {
            ...generateProblem(skillConfig.type, level, {
                min: skillConfig.min,
                max: dynamicMax,
            }),
            skillKey: selectedSkillKey,
        };
    }

    getLessonProblem(skillKey: string, useWordProblem: boolean = false): Problem & { skillKey: string } {
        const skillConfig = MICRO_SKILLS[skillKey] || MICRO_SKILLS['addition_basic'];
        const level = this.userProfile.level || 1;

        // Use dynamic max similar to main game loop
        let dynamicMax = skillConfig.max;
        if (skillKey.includes('double')) {
            dynamicMax = Math.min(100, 20 + (level * 30));
        }

        let problem = {
            ...generateProblem(skillConfig.type, level, {
                min: skillConfig.min,
                max: dynamicMax,
            }),
            skillKey,
        };

        if (useWordProblem) {
            problem = {
                ...convertToWordProblem(problem),
                skillKey
            };
        }

        return problem;
    }

    private getEligibleSkills(level: number): string[] {
        const allSkills = Object.keys(MICRO_SKILLS);

        if (level === 1) return ['add_basic_10', 'sub_basic_10'];
        if (level === 2) return ['add_basic_10', 'sub_basic_10', 'add_carry_20', 'sub_no_borrow_20', 'mult_tables_5'];
        if (level === 3) return ['add_carry_20', 'sub_borrow_20', 'add_tens', 'mult_tables_5', 'mult_tables_9', 'div_basic_tables'];
        if (level === 4) return ['add_tens', 'mult_tables_9', 'div_basic_tables', 'fraction_simplification', 'perc_50'];
        if (level === 5) return ['mult_tables_12', 'mult_by_11', 'fraction_addition', 'perc_10', 'perc_25', 'decimal_basic'];
        if (level === 6) return ['add_near_100', 'sub_near_100', 'mult_double_single', 'perc_10_50', 'dec_add_simple'];
        if (level === 7) return ['add_double_100', 'sub_double_100', 'pow_squares_end5', 'powers_basic', 'roots_basic'];

        // Level 8+: Access to all skills
        return allSkills;
    }

    processResult(problem: Problem, userAnswer: string, timeTaken: number): ProblemResult {
        // Handle string comparison for fractions, number for others
        let isCorrect = false;
        if (typeof problem.answer === 'number') {
            isCorrect = parseFloat(userAnswer) === problem.answer;
        } else {
            isCorrect = userAnswer.trim() === problem.answer.toString();
        }

        if (isCorrect) {
            this.currentStreak++;
        } else {
            this.currentStreak = 0;
        }

        const result = {
            problemId: problem.id,
            isCorrect,
            timeTaken,
            timestamp: Date.now(),
            skillKey: (problem as any).skillKey,
        };

        this.sessionHistory.push(result);

        return {
            isCorrect,
            streak: this.currentStreak,
            correctAnswer: problem.answer,
            feedback: this.generateFeedback(isCorrect, timeTaken, problem.answer, userAnswer),
            strategyHint: !isCorrect ? this.getStrategyHint(problem) : undefined,
            proficiencyDelta: isCorrect ? (timeTaken < 5 ? 5 : 2) : -5,
            skillKey: (problem as any).skillKey
        };
    }

    private generateFeedback(isCorrect: boolean, timeTaken: number, correctAnswer?: number | string, userAnswer?: string): string {
        let isClose = false;
        if (!isCorrect && typeof correctAnswer === 'number' && userAnswer) {
            const val = parseFloat(userAnswer);
            if (!isNaN(val)) {
                // Consider it close if off by 1-2 or 10%
                const diff = Math.abs(val - (correctAnswer as number));
                isClose = diff <= 2 || diff / (correctAnswer as number) < 0.1;
            }
        }
        return Persona.getFeedback(isCorrect, timeTaken, isClose);
    }

    getStrategyHint(problem: Problem): Hint {
        const { type, num1, num2 } = problem;
        const n1 = Number(num1);
        const n2 = Number(num2);

        // Log only first hint generation per type
        logger.once(`hint-${type}`, 'info', `First ${type} hint generated`);

        switch (type) {
            case 'addition':
                if (n1 > 90 && n1 < 100) {
                    const diff = 100 - n1;
                    const result = 100 + n2 - diff;
                    return {
                        text: `💡 **Compensation**: ${n1} is close to 100. Add 100, then subtract ${diff}.`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: 'Compensation',
                            steps: [
                                { label: `100 + ${n2}`, value: (100 + n2).toString() },
                                { label: `- ${diff}`, value: result.toString(), highlight: true }
                            ]
                        }
                    };
                }
                if (n2 > 90 && n2 < 100) {
                    const diff = 100 - n2;
                    const result = n1 + 100 - diff;
                    return {
                        text: `💡 **Compensation**: ${n2} is close to 100. Add 100, then subtract ${diff}.`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: 'Compensation',
                            steps: [
                                { label: `${n1} + 100`, value: (n1 + 100).toString() },
                                { label: `- ${diff}`, value: result.toString(), highlight: true }
                            ]
                        }
                    };
                }

                // Fallback to advanced hint if available
                const advancedAdd = getAdvancedHint('addition', problem);
                if (advancedAdd) return advancedAdd;

                // Default: Break it down
                const tens1 = Math.floor(n1 / 10) * 10;
                const ones1 = n1 % 10;
                const tens2 = Math.floor(n2 / 10) * 10;
                const ones2 = n2 % 10;
                const tensSum = tens1 + tens2;
                const onesSum = ones1 + ones2;
                return {
                    text: `💡 **Break it Down**: Add tens, then ones.
${tens1} + ${tens2} = ${tensSum}
${ones1} + ${ones2} = ${onesSum}
${tensSum} + ${onesSum} = ${n1 + n2}`,
                    visual: {
                        type: 'vertical_breakdown',
                        title: 'Break It Down',
                        steps: [
                            { label: `${tens1} + ${tens2}`, value: tensSum.toString() },
                            { label: `${ones1} + ${ones2}`, value: onesSum.toString(), operation: '+' },
                            { label: 'Total', value: (n1 + n2).toString(), highlight: true }
                        ]
                    }
                };

            case 'subtraction':
                if (!Number.isInteger(n1)) {
                    return {
                        text: `💡 **Line Up Decimals**: Align the dots! Subtract tenths from tenths.`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: 'Align Decimals',
                            steps: [
                                { label: 'Line up decimal points', value: '' },
                                { label: 'Subtract column by column', value: '', highlight: true }
                            ]
                        }
                    };
                }
                if (n2 > 90 && n2 < 100) {
                    const diff = 100 - n2;
                    const result = n1 - 100 + diff;
                    return {
                        text: `💡 **Compensation**: Subtract 100, then add back ${diff}.`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: 'Compensation',
                            steps: [
                                { label: `${n1} - 100`, value: (n1 - 100).toString() },
                                { label: `+ ${diff}`, value: result.toString(), highlight: true }
                            ]
                        }
                    };
                }

                // Visual Count Up
                const nextTen = Math.ceil(n2 / 10) * 10;
                if (nextTen < n1) {
                    return {
                        text: `💡 **Count Up**:
${n2} → ${nextTen} (+${nextTen - n2})
${nextTen} → ${n1} (+${n1 - nextTen})
----------------
Total: ${nextTen - n2} + ${n1 - nextTen}`,
                        visual: {
                            type: 'count_up',
                            title: 'Count Up Strategy',
                            steps: [
                                { label: 'Start', value: n2.toString() },
                                { label: 'Next Ten', value: nextTen.toString(), operation: `+${nextTen - n2}` },
                                { label: 'Target', value: n1.toString(), operation: `+${n1 - nextTen}` },
                                { label: 'Total', value: (n1 - n2).toString(), highlight: true }
                            ]
                        }
                    };
                }

                // Fallback to advanced hint
                const advancedSub = getAdvancedHint('subtraction', problem);
                if (advancedSub) return advancedSub;

                // Default Think Addition with visual
                return {
                    text: `💡 **Think Addition**: ${n2} + ? = ${n1}. Count up from ${n2}.`,
                    visual: {
                        type: 'vertical_breakdown',
                        title: 'Think Addition',
                        steps: [
                            { label: `${n2} + ?`, value: n1.toString() },
                            { label: 'Answer', value: (n1 - n2).toString(), highlight: true }
                        ]
                    }
                };

            case 'multiplication':
                // Special multipliers with visual data
                if (n2 === 11 && n1 < 100) {
                    const digit1 = Math.floor(n1 / 10);
                    const digit2 = n1 % 10;
                    const middle = digit1 + digit2;
                    const carry = Math.floor(middle / 10);
                    return {
                        text: `💡 **11s Trick**: Split digits, add middle.
${digit1} | ${middle} | ${digit2}${middle >= 10 ? ` (carry ${carry})` : ''}`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: '11s Trick',
                            steps: [
                                { label: 'First digit', value: digit1.toString() },
                                { label: 'Sum (middle)', value: middle.toString() },
                                { label: 'Last digit', value: digit2.toString() },
                                { label: 'Result', value: (n1 * 11).toString(), highlight: true }
                            ]
                        }
                    };
                }
                if (n2 === 5) {
                    const times10 = n1 * 10;
                    const result = times10 / 2;
                    return {
                        text: `💡 **5s Trick**: Multiply by 10, then halve.`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: '×5 = ×10 ÷ 2',
                            steps: [
                                { label: `${n1} × 10`, value: times10.toString() },
                                { label: '÷ 2', value: result.toString(), highlight: true }
                            ]
                        }
                    };
                }
                if (n2 === 4) {
                    const d1 = n1 * 2;
                    const d2 = d1 * 2;
                    return {
                        text: `💡 **Double Double**: Double twice.`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: '×4 = Double Double',
                            steps: [
                                { label: `${n1} × 2`, value: d1.toString() },
                                { label: `${d1} × 2`, value: d2.toString(), highlight: true }
                            ]
                        }
                    };
                }
                if (n2 === 9) {
                    const times10 = n1 * 10;
                    const result = times10 - n1;
                    return {
                        text: `💡 **9s Trick**: Multiply by 10, then subtract once.`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: '×9 = ×10 - n',
                            steps: [
                                { label: `${n1} × 10`, value: times10.toString() },
                                { label: `- ${n1}`, value: result.toString(), highlight: true }
                            ]
                        }
                    };
                }
                if (n2 === 8) {
                    const d1 = n1 * 2;
                    const d2 = d1 * 2;
                    const d3 = d2 * 2;
                    return {
                        text: `💡 **8s Trick**: Triple double.`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: '×8 = Triple Double',
                            steps: [
                                { label: `${n1} × 2`, value: d1.toString() },
                                { label: `× 2`, value: d2.toString() },
                                { label: `× 2`, value: d3.toString(), highlight: true }
                            ]
                        }
                    };
                }

                // Near-100 compensation with visual
                if (n2 >= 90 && n2 <= 99) {
                    const diff = 100 - n2;
                    const step1 = n1 * 100;
                    const step2 = n1 * diff;
                    return {
                        text: `💡 **Near 100**: ×100 then subtract.`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: 'Near 100',
                            steps: [
                                { label: `${n1} × 100`, value: step1.toString() },
                                { label: `- (${n1} × ${diff})`, value: step2.toString(), operation: '-' },
                                { label: 'Result', value: (step1 - step2).toString(), highlight: true }
                            ]
                        }
                    };
                }
                if (n1 >= 90 && n1 <= 99) {
                    const diff = 100 - n1;
                    const step1 = 100 * n2;
                    const step2 = diff * n2;
                    return {
                        text: `💡 **Near 100**: ×100 then subtract.`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: 'Near 100',
                            steps: [
                                { label: `100 × ${n2}`, value: step1.toString() },
                                { label: `- (${diff} × ${n2})`, value: step2.toString(), operation: '-' },
                                { label: 'Result', value: (step1 - step2).toString(), highlight: true }
                            ]
                        }
                    };
                }

                // Break into friendlier chunks (both numbers 2-digit)
                if (n1 > 10 && n2 > 10 && n1 < 100 && n2 < 100) {
                    // Round to nearest 10
                    const roundN1 = Math.round(n1 / 10) * 10;
                    const roundN2 = Math.round(n2 / 10) * 10;

                    if (Math.abs(n1 - roundN1) <= 5 && roundN1 !== n1) {
                        const diff = n1 - roundN1;
                        if (diff > 0) {
                            return { text: `💡 **Round & Adjust**: (${roundN1} x ${n2}) + (${diff} x ${n2}). Start with ${roundN1 * n2}, then add ${diff * n2}.` };
                        } else {
                            return { text: `💡 **Round & Adjust**: (${roundN1} x ${n2}) - (${Math.abs(diff)} x ${n2}). Start with ${roundN1 * n2}, then subtract ${Math.abs(diff) * n2}.` };
                        }
                    }

                    if (Math.abs(n2 - roundN2) <= 5 && roundN2 !== n2) {
                        const diff = n2 - roundN2;
                        if (diff > 0) {
                            return { text: `💡 **Round & Adjust**: (${n1} x ${roundN2}) + (${n1} x ${diff}). Start with ${n1 * roundN2}, then add ${n1 * diff}.` };
                        } else {
                            return { text: `💡 **Round & Adjust**: (${n1} x ${roundN2}) - (${n1} x ${Math.abs(diff)}). Start with ${n1 * roundN2}, then subtract ${n1 * Math.abs(diff)}.` };
                        }
                    }
                }

                // Fallback to advanced hint
                const advancedMult = getAdvancedHint('multiplication', problem);
                if (advancedMult) return advancedMult;

                // Default Visual Breakdown
                const tens = Math.floor(n1 / 10) * 10;
                const ones = n1 % 10;
                if (tens > 0 && ones > 0) {
                    return {
                        text: `💡 **Break It Down**:
${tens} x ${n2} = ${tens * n2}
${ones} x ${n2} = ${ones * n2}
----------------
${tens * n2} + ${ones * n2} = ${n1 * n2}`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: 'Break It Down',
                            steps: [
                                { label: `${tens} x ${n2}`, value: (tens * n2).toString() },
                                { label: `${ones} x ${n2}`, value: (ones * n2).toString(), operation: '+' },
                                { label: 'Total', value: (n1 * n2).toString(), highlight: true }
                            ]
                        }
                    };
                }

                return { text: `💡 **Break It Down**: Think of ${n1} x ${n2} in chunks. Try (${Math.floor(n1 / 10) * 10} x ${n2}) + (${n1 % 10} x ${n2}).` };

            case 'division':
                // Calculate the answer for reference
                const divAnswer = Math.floor(n1 / n2);
                const divRemainder = n1 % n2;

                // For small divisors (2-12), use multiplication tables
                if (n2 <= 12) {
                    // Find a good starting point (nearest multiple of 5 or 10)
                    const anchor5 = 5;
                    const anchor10 = 10;
                    const product5 = anchor5 * n2;
                    const product10 = anchor10 * n2;

                    // Choose the anchor closest to but not exceeding n1
                    let anchor = 1;
                    let anchorProduct = n2;

                    if (product10 <= n1) {
                        anchor = anchor10;
                        anchorProduct = product10;
                    } else if (product5 <= n1) {
                        anchor = anchor5;
                        anchorProduct = product5;
                    }

                    const remaining = n1 - anchorProduct;
                    const remainingQuotient = Math.floor(remaining / n2);

                    if (anchor > 1 && remaining >= 0) {
                        return {
                            text: `💡 **Think Multiplication**:
? × ${n2} = ${n1}
Step 1: ${anchor} × ${n2} = ${anchorProduct}
Step 2: ${remainingQuotient} × ${n2} = ${remainingQuotient * n2}
Answer: ${anchor} + ${remainingQuotient} = ${divAnswer}${divRemainder > 0 ? ` R${divRemainder}` : ''}`,
                            visual: {
                                type: 'vertical_breakdown',
                                title: 'Think Multiplication',
                                steps: [
                                    { label: `${anchor} × ${n2}`, value: anchorProduct.toString() },
                                    { label: `${remainingQuotient} × ${n2}`, value: (remainingQuotient * n2).toString(), operation: '+' },
                                    { label: 'Total', value: divAnswer.toString(), highlight: true }
                                ]
                            }
                        };
                    }
                }

                // Simple hint for basic division
                return {
                    text: `💡 **Think Multiplication**:
? × ${n2} = ${n1}
What number times ${n2} equals ${n1}?
Answer: ${divAnswer}${divRemainder > 0 ? ` remainder ${divRemainder}` : ''}`,
                    visual: {
                        type: 'vertical_breakdown',
                        title: 'Think Multiplication',
                        steps: [
                            { label: `? × ${n2}`, value: n1.toString() },
                            { label: 'Answer', value: divAnswer.toString(), highlight: true }
                        ]
                    }
                };

            case 'fraction_simplification':
                // For fraction simplification, num1 is numerator, num2 is denominator
                // Find GCD for simplification guidance
                const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
                const divisor = gcd(Math.abs(n1), Math.abs(n2));
                const simplifiedNum = n1 / divisor;
                const simplifiedDen = n2 / divisor;

                if (divisor > 1) {
                    return {
                        text: `💡 **Find Common Factor**:
Both ${n1} and ${n2} are divisible by ${divisor}
${n1} ÷ ${divisor} = ${simplifiedNum}
${n2} ÷ ${divisor} = ${simplifiedDen}
Simplified: ${simplifiedNum}/${simplifiedDen}`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: 'Simplify Fraction',
                            steps: [
                                { label: `${n1} ÷ ${divisor}`, value: simplifiedNum.toString() },
                                { label: `${n2} ÷ ${divisor}`, value: simplifiedDen.toString() },
                                { label: 'Result', value: `${simplifiedNum}/${simplifiedDen}`, highlight: true }
                            ]
                        }
                    };
                }
                return { text: `💡 **Already Simplified**: ${n1}/${n2} cannot be simplified further.` };

            case 'fraction_addition':
                // For fraction addition, we need to find common denominator
                // This is a simplified hint - actual problem may have different structure
                return {
                    text: `💡 **Like Fractions**: If denominators match, add numerators.
If different, find LCD (Lowest Common Denominator).
Step 1: Multiply denominators to find LCD
Step 2: Convert each fraction
Step 3: Add numerators
Step 4: Simplify if needed`,
                    visual: {
                        type: 'vertical_breakdown',
                        title: 'Add Fractions',
                        steps: [
                            { label: 'Find LCD', value: 'Multiply denominators' },
                            { label: 'Convert', value: 'Same denominator' },
                            { label: 'Add', value: 'Numerators only' },
                            { label: 'Simplify', value: 'If possible', highlight: true }
                        ]
                    }
                };

            case 'decimal_basic':
                // Decimal addition/operations
                return {
                    text: `💡 **Align Decimals**:
Step 1: Line up the decimal points vertically
Step 2: Add zeros if needed to match place values
Step 3: Add/subtract column by column from right to left
Step 4: Bring down the decimal point`,
                    visual: {
                        type: 'vertical_breakdown',
                        title: 'Decimal Alignment',
                        steps: [
                            { label: 'Align', value: 'Line up decimal points' },
                            { label: 'Fill', value: 'Add trailing zeros' },
                            { label: 'Calculate', value: 'Right to left' },
                            { label: 'Place decimal', value: 'Straight down', highlight: true }
                        ]
                    }
                };

            case 'percentage_basic':
                const p = parseInt(num1.toString());
                const num2Val = Number(num2);

                if (p === 10) {
                    const result = num2Val / 10;
                    return {
                        text: `💡 **10%**: Move decimal one place left.
${num2} → ${result}`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: '10% = ÷10',
                            steps: [
                                { label: 'Original', value: num2Val.toString() },
                                { label: 'Move decimal ←', value: result.toString(), highlight: true }
                            ]
                        }
                    };
                }
                if (p === 50) {
                    const result = num2Val / 2;
                    return {
                        text: `💡 **50%**: Just cut the number in half.
${num2} ÷ 2 = ${result}`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: '50% = ÷2',
                            steps: [
                                { label: 'Original', value: num2Val.toString() },
                                { label: 'Half', value: result.toString(), highlight: true }
                            ]
                        }
                    };
                }
                if (p === 25) {
                    const half = num2Val / 2;
                    const result = half / 2;
                    return {
                        text: `💡 **25%**: Half of a half.
${num2} ÷ 2 = ${half}
${half} ÷ 2 = ${result}`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: '25% = ÷2 ÷2',
                            steps: [
                                { label: 'Original', value: num2Val.toString() },
                                { label: '÷ 2', value: half.toString() },
                                { label: '÷ 2', value: result.toString(), highlight: true }
                            ]
                        }
                    };
                }
                if (p === 20) {
                    const tenPct = num2Val / 10;
                    const result = tenPct * 2;
                    return {
                        text: `💡 **20%**: Find 10%, then double it.
10% of ${num2} = ${tenPct}
${tenPct} × 2 = ${result}`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: '20% = 10% × 2',
                            steps: [
                                { label: '10%', value: tenPct.toString() },
                                { label: '× 2', value: result.toString(), highlight: true }
                            ]
                        }
                    };
                }

                // Fallback to advanced
                const advancedPerc = getAdvancedHint('percentages', problem);
                if (advancedPerc) return advancedPerc;

                // Generic
                const genericResult = (p / 100) * num2Val;
                return {
                    text: `💡 **${p}%**: Means ${p}/100.
${p}/100 × ${num2} = ${genericResult}`,
                    visual: {
                        type: 'vertical_breakdown',
                        title: `${p}%`,
                        steps: [
                            { label: `${p}/100`, value: (p / 100).toString() },
                            { label: `× ${num2}`, value: genericResult.toString(), highlight: true }
                        ]
                    }
                };

            case 'powers_basic':
                // For squaring numbers
                if (n2 === 2) {
                    // Numbers ending in 5
                    if (n1 % 10 === 5) {
                        const prefix = Math.floor(n1 / 10);
                        const result = prefix * (prefix + 1);
                        return {
                            text: `💡 **Ends in 5 Trick**:
${n1}² = (${prefix} × ${prefix + 1}) with 25 at the end
Step 1: ${prefix} × ${prefix + 1} = ${result}
Step 2: Append "25"
Answer: ${result}25`,
                            visual: {
                                type: 'vertical_breakdown',
                                title: 'Ends in 5 Trick',
                                steps: [
                                    { label: `${prefix} × ${prefix + 1}`, value: result.toString() },
                                    { label: 'Append 25', value: '25' },
                                    { label: 'Answer', value: `${result}25`, highlight: true }
                                ]
                            }
                        };
                    }
                    // Numbers near a multiple of 10
                    const base10 = Math.round(n1 / 10) * 10;
                    const diff = n1 - base10;
                    if (Math.abs(diff) <= 3 && diff !== 0) {
                        return {
                            text: `💡 **Near ${base10} Trick**:
${n1}² = ${base10}² + 2×${base10}×${diff > 0 ? diff : `(${diff})`} + ${Math.abs(diff)}²
     = ${base10 * base10} ${diff > 0 ? '+' : '-'} ${Math.abs(2 * base10 * diff)} + ${diff * diff}
     = ${n1 * n1}`,
                            visual: {
                                type: 'vertical_breakdown',
                                title: `Near ${base10} Method`,
                                steps: [
                                    { label: `${base10}²`, value: (base10 * base10).toString() },
                                    { label: `2×${base10}×${Math.abs(diff)}`, value: (Math.abs(2 * base10 * diff)).toString(), operation: diff > 0 ? '+' : '-' },
                                    { label: `${Math.abs(diff)}²`, value: (diff * diff).toString(), operation: '+' },
                                    { label: 'Answer', value: (n1 * n1).toString(), highlight: true }
                                ]
                            }
                        };
                    }
                }

                // Fallback to advanced hint
                const advancedPow = getAdvancedHint('powers', problem);
                if (advancedPow) return advancedPow;

                // Generic power hint
                return {
                    text: `💡 **Power of ${n2}**: Multiply ${n1} by itself ${n2} times.
${n1}^${n2} = ${Array(n2).fill(n1).join(' × ')} = ${Math.pow(n1, n2)}`,
                    visual: {
                        type: 'vertical_breakdown',
                        title: `Power of ${n2}`,
                        steps: [
                            { label: `${n1}^${n2}`, value: Array(n2).fill(n1).join(' × ') },
                            { label: 'Answer', value: Math.pow(n1, n2).toString(), highlight: true }
                        ]
                    }
                };

            case 'roots_basic':
                // n1 is the number under the root, n2 is typically 2 for square root
                const sqrtAnswer = Math.sqrt(n1);
                const isPerfectSquare = Number.isInteger(sqrtAnswer);

                if (isPerfectSquare) {
                    // Find estimation range
                    const lowerBound = Math.floor(Math.sqrt(n1 / 100)) * 10;
                    const upperBound = lowerBound + 10;

                    // Check last digit patterns
                    const lastDigit = n1 % 10;
                    let possibleEndings = '';
                    if (lastDigit === 1) possibleEndings = '1 or 9';
                    else if (lastDigit === 4) possibleEndings = '2 or 8';
                    else if (lastDigit === 9) possibleEndings = '3 or 7';
                    else if (lastDigit === 6) possibleEndings = '4 or 6';
                    else if (lastDigit === 5) possibleEndings = '5';
                    else if (lastDigit === 0) possibleEndings = '0';
                    else possibleEndings = 'check calculation';

                    return {
                        text: `💡 **Square Root Strategy**:
√${n1} = ?
Step 1: Estimate range: ${lowerBound}² = ${lowerBound * lowerBound}, ${upperBound}² = ${upperBound * upperBound}
Step 2: Last digit ${lastDigit} → root ends in ${possibleEndings}
Step 3: Try ${sqrtAnswer}² = ${sqrtAnswer * sqrtAnswer} ✓
Answer: ${sqrtAnswer}`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: 'Square Root Estimation',
                            steps: [
                                { label: `${lowerBound}²`, value: (lowerBound * lowerBound).toString() },
                                { label: `${upperBound}²`, value: (upperBound * upperBound).toString() },
                                { label: `Ends in: ${possibleEndings}`, value: '' },
                                { label: 'Answer', value: sqrtAnswer.toString(), highlight: true }
                            ]
                        }
                    };
                } else {
                    // Non-perfect square - give approximation
                    const approx = Math.round(sqrtAnswer * 10) / 10;
                    const lower = Math.floor(sqrtAnswer);
                    const upper = Math.ceil(sqrtAnswer);
                    return {
                        text: `💡 **Estimate Square Root**:
√${n1} is between ${lower} and ${upper}
${lower}² = ${lower * lower}
${upper}² = ${upper * upper}
Approximate: ${approx}`,
                        visual: {
                            type: 'vertical_breakdown',
                            title: 'Square Root Estimation',
                            steps: [
                                { label: `${lower}²`, value: (lower * lower).toString() },
                                { label: `${upper}²`, value: (upper * upper).toString() },
                                { label: 'Approx', value: approx.toString(), highlight: true }
                            ]
                        }
                    };
                }

            default:
                // Fallback to a generic mental‑math hint from the manual
                const protocols = MENTAL_MATH_MANUAL.protocols;
                const randomProtocol = protocols[Math.floor(Math.random() * protocols.length)];
                return { text: `💡 **${randomProtocol.title}**: ${randomProtocol.tactic}` };
        }
    }

    getSessionSummary() {
        const totalProblems = this.sessionHistory.length;
        const correctProblems = this.sessionHistory.filter(p => p.isCorrect).length;
        const accuracy = totalProblems > 0 ? (correctProblems / totalProblems) * 100 : 0;
        const avgSpeed = totalProblems > 0
            ? this.sessionHistory.reduce((acc, p) => acc + p.timeTaken, 0) / totalProblems
            : 0;

        // Identify struggled skill
        const skillStats: Record<string, { correct: number; total: number }> = {};
        this.sessionHistory.forEach(p => {
            if (!skillStats[p.skillKey]) skillStats[p.skillKey] = { correct: 0, total: 0 };
            skillStats[p.skillKey].total++;
            if (p.isCorrect) skillStats[p.skillKey].correct++;
        });

        let struggledSkillKey = null;
        let lowestAccuracy = 100;

        Object.entries(skillStats).forEach(([key, stats]) => {
            const acc = (stats.correct / stats.total) * 100;
            if (acc < lowestAccuracy && stats.total >= 3) {
                lowestAccuracy = acc;
                struggledSkillKey = key;
            }
        });

        return {
            totalProblems,
            correctProblems,
            accuracy,
            avgSpeed,
            struggledSkillKey,
            lowestAccuracy,
            xpEarned: this.calculateXP()
        };
    }

    getDetailedBreakdown(skillKey: string) {
        const config = MICRO_SKILLS[skillKey];
        if (!config) return { title: 'Practice', steps: ['Keep practicing!'] };

        // Return static advice based on skill type
        return {
            title: `Mastering ${skillKey.replace(/_/g, ' ')}`,
            steps: [
                config.strategyHint || 'Focus on accuracy first, then speed.',
                'Practice heavily on this specific skill.',
                config.feedback || 'You got this!'
            ]
        };
    }

    private calculateXP(): number {
        return this.sessionHistory.filter(p => p.isCorrect).length * 10 + (this.userProfile.level * 5);
    }
}
