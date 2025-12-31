export interface ProblemConstraints {
    min: number;
    max: number;
    allowNegatives?: boolean;
    ensureIntegerResult?: boolean;
}

export interface Problem {
    id: string;
    type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fraction_simplification' | 'fraction_addition' | 'percentage_basic' | 'decimal_basic' | 'powers_basic' | 'roots_basic';
    num1: number | string;
    num2?: number | string;
    operation: string;
    answer: number | string;
    question?: string;
    isWordProblem?: boolean;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
};

export const generateProblem = (
    type: string,
    level: number,
    constraints?: { min?: number; max?: number }
): Problem => {
    const min = constraints?.min || 1;
    const max = constraints?.max || 10;

    if (type === 'fraction_simplification') {
        let numerator, denominator, divisor;
        do {
            divisor = Math.floor(Math.random() * (level + 1)) + 2;
            const reducedNum = Math.floor(Math.random() * 5) + 1;
            const reducedDenom = reducedNum + Math.floor(Math.random() * 5) + 1;
            numerator = reducedNum * divisor;
            denominator = reducedDenom * divisor;
        } while (numerator >= denominator);

        return {
            id: generateId(),
            type: 'fraction_simplification',
            num1: `${numerator}/${denominator}`,
            operation: 'simplify',
            answer: `${numerator / divisor}/${denominator / divisor}`
        };
    }

    if (type === 'fraction_addition') {
        const denom = Math.floor(Math.random() * 8) + 2;
        const num1 = Math.floor(Math.random() * (denom - 1)) + 1;
        const num2 = Math.floor(Math.random() * (denom - num1)) + 1;

        return {
            id: generateId(),
            type: 'fraction_addition',
            num1: `${num1}/${denom}`,
            num2: `${num2}/${denom}`,
            operation: '+',
            answer: `${num1 + num2}/${denom}`
        };
    }

    if (type === 'percentage_basic') {
        const allPercentages = [10, 20, 25, 50, 75, 27, 15, 40];
        // Filter percentages based on constraints (min/max)
        const allowedPercentages = allPercentages.filter(p => p >= min && p <= max);

        // Fallback if no percentages match (shouldn't happen with correct config, but safe default)
        const percentages = allowedPercentages.length > 0 ? allowedPercentages : [10];

        const percent = percentages[Math.floor(Math.random() * percentages.length)];
        let base = 0;
        switch (percent) {
            case 10:
                base = (Math.floor(Math.random() * (10 * level)) + 1) * 10;
                break;
            case 20:
                base = (Math.floor(Math.random() * (10 * level)) + 1) * 5;
                break;
            case 25:
            case 75:
                base = (Math.floor(Math.random() * (5 * level)) + 1) * 4;
                break;
            case 50:
                base = (Math.floor(Math.random() * (10 * level)) + 1) * 2;
                break;
            case 15:
                base = (Math.floor(Math.random() * (2 * level)) + 1) * 20;
                break;
            case 40:
                base = (Math.floor(Math.random() * (4 * level)) + 1) * 5;
                break;
            case 27:
                base = (Math.floor(Math.random() * (level)) + 1) * 100;
                break;
            default:
                // Fallback for any other percentage, ensuring a reasonable base
                base = (Math.floor(Math.random() * (10 * level)) + 1) * 10;
                break;
        }

        return {
            id: generateId(),
            type: 'percentage_basic',
            num1: `${percent}%`,
            num2: base,
            operation: 'of',
            answer: (percent / 100) * base
        };
    }

    if (type === 'decimal_basic') {
        const subType = Math.random();

        if (subType < 0.5) {
            // Addition/Subtraction of simple decimals
            const n1 = (Math.floor(Math.random() * 20) + 1) / 10;
            const n2 = (Math.floor(Math.random() * 20) + 1) / 10;
            const isAdd = Math.random() > 0.5;

            if (isAdd) {
                const ans = Math.round((n1 + n2) * 10) / 10;
                return {
                    id: generateId(),
                    type: 'addition', // Reuse addition type for rendering
                    num1: n1,
                    num2: n2,
                    operation: '+',
                    answer: ans
                };
            } else {
                const maxVal = Math.max(n1, n2);
                const minVal = Math.min(n1, n2);
                const ans = Math.round((maxVal - minVal) * 10) / 10;
                return {
                    id: generateId(),
                    type: 'subtraction',
                    num1: maxVal,
                    num2: minVal,
                    operation: '-',
                    answer: ans
                };
            }
        } else {
            // Multiplication by 10 or 100
            const n1 = (Math.floor(Math.random() * 100) + 1) / 10;
            const mult = Math.random() > 0.5 ? 10 : 100;
            const ans = Math.round((n1 * mult) * 10) / 10;
            return {
                id: generateId(),
                type: 'multiplication',
                num1: n1,
                num2: mult,
                operation: '×',
                answer: ans
            };
        }
    }

    if (type === 'powers_basic') {
        const isCube = Math.random() > 0.8; // 20% chance for cubes

        if (isCube) {
            const base = Math.floor(Math.random() * 5) + 1; // 1 to 5
            return {
                id: generateId(),
                type: 'powers_basic',
                num1: base,
                num2: 3,
                operation: '^',
                answer: Math.pow(base, 3)
            };
        } else {
            const base = Math.floor(Math.random() * 15) + 1; // 1 to 15
            return {
                id: generateId(),
                type: 'powers_basic',
                num1: base,
                num2: 2,
                operation: '^',
                answer: Math.pow(base, 2)
            };
        }
    }

    if (type === 'roots_basic') {
        const root = Math.floor(Math.random() * 100) + 1; // 1 to 15
        const square = root * root;

        return {
            id: generateId(),
            type: 'roots_basic',
            num1: square,
            operation: '√',
            answer: root
        };
    }

    const num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const num2 = Math.floor(Math.random() * (max - min + 1)) + min;

    switch (type) {
        case 'addition':
            return {
                id: generateId(),
                type: 'addition',
                num1,
                num2,
                operation: '+',
                answer: num1 + num2,
            };
        case 'subtraction':
            const maxVal = Math.max(num1, num2);
            const minVal = Math.min(num1, num2);
            return {
                id: generateId(),
                type: 'subtraction',
                num1: maxVal,
                num2: minVal,
                operation: '-',
                answer: maxVal - minVal,
            };
        case 'multiplication':
            return {
                id: generateId(),
                type: 'multiplication',
                num1,
                num2,
                operation: '×',
                answer: num1 * num2,
            };
        case 'division':
            const product = num1 * num2;
            return {
                id: generateId(),
                type: 'division',
                num1: product,
                num2: num1,
                operation: '÷',
                answer: num2,
            };
            return {
                id: generateId(),
                type: 'addition',
                num1,
                num2,
                operation: '+',
                answer: num1 + num2,
            };
    }
};

export const generateProblemFromError = (originalProblem: Problem, errorType?: string): Problem => {
    // Basic fallback: same type, similar numbers
    const difficultyMultiplier = originalProblem.num1.toString().length;
    let min = Math.pow(10, difficultyMultiplier - 1);
    let max = Math.pow(10, difficultyMultiplier);

    // Adjust min/max based on original numbers if they are numbers
    if (typeof originalProblem.num1 === 'number') {
        min = Math.floor(originalProblem.num1 * 0.5);
        max = Math.ceil(originalProblem.num1 * 1.5);
    }

    if (errorType === 'CARRYING_ERROR' && originalProblem.operation === '+') {
        // Force a carrying problem
        // e.g. 15 + 7.  5+7 > 10.
        const num1 = Math.floor(Math.random() * (max - min)) + min;
        const ones1 = num1 % 10;
        // ensure ones2 + ones1 >= 10
        const minOnes2 = 10 - ones1;
        // Force at least one digit to cause carry
        const num2Base = Math.floor(Math.random() * (max - min)) + min;
        let num2 = (Math.floor(num2Base / 10) * 10) + minOnes2 + Math.floor(Math.random() * (9 - minOnes2 + 1));

        return {
            id: generateId(),
            type: 'addition',
            num1,
            num2,
            operation: '+',
            answer: num1 + num2
        };
    }

    if (errorType === 'BORROWING_ERROR' && originalProblem.operation === '-') {
        // Force a borrowing problem
        // e.g. 23 - 7. 3 < 7.
        const num1 = Math.floor(Math.random() * (max - min)) + min;
        const ones1 = num1 % 10;

        // ensure ones2 > ones1
        const num2Base = Math.floor(Math.random() * (num1 * 0.5)); // subtract smaller number
        let num2 = (Math.floor(num2Base / 10) * 10) + ones1 + 1 + Math.floor(Math.random() * (9 - ones1 - 1));
        if (num2 > num1) num2 = num1 - 1; // safety

        return {
            id: generateId(),
            type: 'subtraction',
            num1,
            num2,
            operation: '-',
            answer: num1 - num2
        };
    }

    // Default: Regenerate with same parameters
    // We can infer level from number magnitude roughly
    const level = Math.ceil(Math.log10(max));
    return generateProblem(originalProblem.type, level, { min, max });
};
