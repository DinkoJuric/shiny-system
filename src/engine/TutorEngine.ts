import type { Problem } from './ProblemGenerator';
import type { ErrorType } from './DiagnosticEngine';

export interface Step {
    text: string;
    subCalculation?: string;
}

export interface TutorGuide {
    problemId: string;
    errorType: ErrorType;
    steps: Step[];
    strategy: string;
}

export class TutorEngine {
    static generateGuide(problem: Problem, errorType: ErrorType): TutorGuide {
        return {
            problemId: `${problem.num1}-${problem.operation}-${problem.num2}`,
            errorType,
            steps: this.generateSteps(problem),
            strategy: this.getStrategy(errorType)
        };
    }

    private static generateSteps(problem: Problem): Step[] {
        const num1 = Number(problem.num1);
        const num2 = Number(problem.num2);

        if (isNaN(num1) || isNaN(num2)) {
            return [
                { text: `Solve: ${problem.num1} ${problem.operation} ${problem.num2}` },
                { text: `The answer is ${problem.answer}.` }
            ];
        }

        switch (problem.operation) {
            case '+':
                return this.generateAdditionSteps(num1, num2);
            case '-':
                return this.generateSubtractionSteps(num1, num2);
            case '×':
                return this.generateMultiplicationSteps(num1, num2);
            case '÷':
                return this.generateDivisionSteps(num1, num2);
            default:
                return [{ text: `The answer is ${problem.answer}.` }];
        }
    }

    private static generateAdditionSteps(num1: number, num2: number): Step[] {
        const steps: Step[] = [];
        if (num2 >= 10) {
            // Running Total Strategy (Left-to-Right)
            const tens = Math.floor(num2 / 10) * 10;
            const ones = num2 % 10;
            const intermediate = num1 + tens;

            steps.push({
                text: `Start with the first number.`,
                subCalculation: `${num1}`
            });
            steps.push({
                text: `Add the tens from ${num2}.`,
                subCalculation: `${num1} + ${tens} = ${intermediate}`
            });
            if (ones > 0) {
                steps.push({
                    text: `Add the remaining ones.`,
                    subCalculation: `${intermediate} + ${ones} = ${intermediate + ones}`
                });
            }
        } else {
            steps.push({ text: `Start with ${num1}.` });
            steps.push({ text: `Count up by ${num2}.`, subCalculation: `${num1} + ${num2} = ${num1 + num2}` });
        }
        return steps;
    }

    private static generateSubtractionSteps(num1: number, num2: number): Step[] {
        const steps: Step[] = [];

        // Strategy: Complementary Numbers (All from 9, Last from 10)
        // Best when subtracting from powers of 10 (100, 1000, etc.)
        const log10 = Math.log10(num1);
        if (Number.isInteger(log10) && log10 >= 2 && num1 > num2) {
            steps.push({ text: `Subtracting from ${num1}? Use "All from 9, last from 10".` });
            steps.push({ text: `Subtract every digit of ${num2} from 9, except the last non-zero digit.` });
            steps.push({ text: `Subtract the last non-zero digit from 10.` });
            steps.push({ text: `Result is ${num1 - num2}.` });
            return steps;
        }

        if (num2 >= 10) {
            // Running Total Strategy (Left-to-Right)
            const tens = Math.floor(num2 / 10) * 10;
            const ones = num2 % 10;
            const intermediate = num1 - tens;

            steps.push({
                text: `Start with the first number.`,
                subCalculation: `${num1}`
            });
            steps.push({
                text: `Subtract the tens from ${num2}.`,
                subCalculation: `${num1} - ${tens} = ${intermediate}`
            });
            if (ones > 0) {
                steps.push({
                    text: `Subtract the remaining ones.`,
                    subCalculation: `${intermediate} - ${ones} = ${intermediate - ones}`
                });
            }
        } else {
            steps.push({ text: `Start at ${num1} and count backwards by ${num2}.` });
        }
        return steps;
    }

    private static generateMultiplicationSteps(num1: number, num2: number): Step[] {
        const steps: Step[] = [];

        // Strategy: Squaring numbers ending in 5
        if (num1 === num2 && num1 % 10 === 5) {
            const firstDigit = Math.floor(num1 / 10);
            const nextPattern = firstDigit * (firstDigit + 1);
            steps.push({ text: `This is a square of a number ending in 5.` });
            steps.push({ text: `Example: ${num1}² ends in 25.`, subCalculation: `...25` });
            steps.push({
                text: `Multiply the first digit(s) by the next number up.`,
                subCalculation: `${firstDigit} × ${firstDigit + 1} = ${nextPattern}`
            });
            steps.push({
                text: `Put it all together.`,
                subCalculation: `${nextPattern}25`
            });
            return steps;
        }

        // Strategy: Multiply by 11
        if (num2 === 11 && num1 >= 10 && num1 <= 99) {
            const digit1 = Math.floor(num1 / 10);
            const digit2 = num1 % 10;
            const sum = digit1 + digit2;
            steps.push({ text: `To multiply by 11, add the digits of ${num1} together.` });
            if (sum < 10) {
                steps.push({
                    text: `Put the sum in the middle.`,
                    subCalculation: `${digit1} + ${digit2} = ${sum}`
                });
                steps.push({ text: `Result: ${digit1}${sum}${digit2}` });
            } else {
                steps.push({
                    text: `Since ${digit1} + ${digit2} = ${sum}, carry the 1.`,
                    subCalculation: `${digit1 + 1}${sum % 10}${digit2}`
                });
            }
            return steps;
        }

        // Strategy: Multiply by 5 (Halve and x10)
        if (num2 === 5 && num1 % 2 === 0) {
            const half = num1 / 2;
            steps.push({ text: `Multiplying by 5 is the same as halving, then multiplying by 10.` });
            steps.push({ text: `First, halve the number.`, subCalculation: `${num1} ÷ 2 = ${half}` });
            steps.push({ text: `Then multiply by 10.`, subCalculation: `${half} × 10 = ${half * 10}` });
            return steps;
        }

        // Strategy: Doubling and Halving (if one is even)
        if (num1 % 2 === 0 && num2 < 50 && num1 < 50) {
            const halved = num1 / 2;
            const doubled = num2 * 2;
            steps.push({ text: `Try doubling and halving!` });
            steps.push({ text: `Halve ${num1} → ${halved}. Double ${num2} → ${doubled}.` });
            steps.push({ text: `Now solve: ${halved} × ${doubled} = ${halved * doubled}` });
            return steps;
        }

        // Default: Break Apart (Left-to-Right)
        if (num2 > 10) {
            const ten2 = Math.floor(num2 / 10) * 10;
            const one2 = num2 % 10;
            steps.push({ text: `Split ${num2} into ${ten2} and ${one2}.` });
            steps.push({ text: `Multiply ${num1} by ${ten2}.`, subCalculation: `${num1} × ${ten2} = ${num1 * ten2}` });
            steps.push({ text: `Multiply ${num1} by ${one2}.`, subCalculation: `${num1} × ${one2} = ${num1 * one2}` });
            steps.push({
                text: `Add the two results.`,
                subCalculation: `${num1 * ten2} + ${num1 * one2} = ${(num1 * ten2) + (num1 * one2)}`
            });
        } else {
            steps.push({ text: `Use your multiplication tables.` });
            steps.push({ text: `${num1} × ${num2} = ${num1 * num2}` });
        }
        return steps;
    }

    private static generateDivisionSteps(num1: number, num2: number): Step[] {
        const steps: Step[] = [];

        // Strategy: Dividing by 5 (Double and Divide by 10)
        if (num2 === 5) {
            steps.push({ text: `Dividing by 5 is the same as doubling, then dividing by 10.` });
            steps.push({ text: `Double the number.`, subCalculation: `${num1} × 2 = ${num1 * 2}` });
            steps.push({ text: `Divide by 10.`, subCalculation: `${num1 * 2} ÷ 10 = ${(num1 * 2) / 10}` });
            return steps;
        }

        // Default: Related Multiplication
        steps.push({ text: `Think of the related multiplication.` });
        steps.push({ text: `What times ${num2} equals ${num1}?`, subCalculation: `? × ${num2} = ${num1}` });
        steps.push({ text: `The answer is ${num1 / num2}.` });

        return steps;
    }

    private static getStrategy(errorType: ErrorType): string {
        switch (errorType) {
            case 'CARRYING_ERROR':
                return "When adding digits that sum to 10 or more, don't forget to 'carry' the 1 to the next column.";
            case 'BORROWING_ERROR':
                return "If the top digit is smaller than the bottom digit, you need to 'borrow' from the left column.";
            case 'SIGN_ERROR':
                return "Watch your negative signs! Two negatives make a positive (in multiplication/division).";
            case 'OFF_BY_ONE':
                return "You were very close! Check your counting or simple facts.";
            case 'CALCULATION_ERROR':
            default:
                return "Take your time and break the problem down into smaller, easier steps.";
        }
    }
}
