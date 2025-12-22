import advancedHintsData from '../../AdvancedMentalMath.json';
import type { Problem } from './ProblemGenerator';

export interface VisualHintStep {
    label?: string;
    value: string;
    operation?: string;
    highlight?: boolean;
}

export interface Hint {
    text: string;
    visual?: {
        type: string;
        title: string;
        steps: VisualHintStep[];
    };
}

export interface StrategyExample {
    problem: string;
    steps: string[];
    verification: string;
}

export interface Strategy {
    name: string;
    alias: string;
    difficulty: string;
    bestFor: string;
    requires: string[] | null;
    examples: StrategyExample[];
    caution: string;
    proTip: string | null;
    whyThisWorks?: string;
    commonEquivalents?: Record<string, string>;
    essentialEquivalents?: Record<string, string>;
    referenceTable?: any;
}

interface OperationCategory {
    strategies: Strategy[];
}

interface AdvancedHintsData {
    operations: Record<string, OperationCategory>;
}

const data = advancedHintsData as unknown as AdvancedHintsData;

export type MentalMathProtocol = {
    protocol_number: number;
    title: string;
    mission: string;
    tactic: string;
    note: string | null;
    examples: Array<{
        target: string;
        steps: Array<{
            step_title: string;
            details: string[];
        }>;
    }>;
};

export const MENTAL_MATH_MANUAL = {
    mindset: {
        title: 'Growth Mindset',
        text: 'Approach each problem with curiosity and confidence. Mistakes are opportunities to learn.'
    },
    protocols: [
        { protocol_number: 1, title: 'General', mission: 'Understand basic strategies.', tactic: 'Break it down into smaller, manageable parts.', note: null, examples: [] },
        { protocol_number: 2, title: 'Estimation', mission: 'Quick approximations.', tactic: 'Round numbers to the nearest 10 or 100 to get a quick estimate.', note: null, examples: [] },
        { protocol_number: 3, title: 'Patterns', mission: 'Identify numeric patterns.', tactic: 'Look for patterns like numbers ending in 0 or 5.', note: null, examples: [] },
        { protocol_number: 4, title: 'Inverse Operations', mission: 'Check work using inverse operations.', tactic: 'Use addition to check subtraction, and multiplication to check division.', note: null, examples: [] }
    ]
};

export const getAdvancedHint = (type: string, problem: Problem): Hint | null => {
    const operationData = data.operations[type];
    if (!operationData) return null;

    // Parse numbers safely
    const n1 = typeof problem.num1 === 'string' ? parseFloat(problem.num1) : problem.num1;
    const n2 = typeof problem.num2 === 'string' ? parseFloat(problem.num2) : (problem.num2 ?? 0);

    // Simple heuristic to find a relevant strategy
    let strategy: Strategy | undefined;

    // Strategy Selection Logic
    if (type === 'addition') {
        if (n1 > 90 || n2 > 90 || (n1 % 10 > 7) || (n2 % 10 > 7)) {
            strategy = operationData.strategies.find(s => s.name === "Round and Adjust");
        } else if (n1 > 100 || n2 > 100) {
            strategy = operationData.strategies.find(s => s.name === "Left-to-Right Addition");
        } else {
            strategy = operationData.strategies.find(s => s.name === "Break Into Chunks");
        }
    } else if (type === 'subtraction') {
        if (n2 > 90 || (n2 % 10 > 7)) {
            strategy = operationData.strategies.find(s => s.name === "Compensation (Round & Adjust)");
        } else {
            strategy = operationData.strategies.find(s => s.name === "Break and Subtract");
        }
    } else if (type === 'multiplication') {
        if (n2 === 11) strategy = operationData.strategies.find(s => s.name === "The 11s Trick");
        else if (n2 === 5) strategy = operationData.strategies.find(s => s.name === "Multiply by 5");
        else if (n2 === 4 || n2 === 8) strategy = operationData.strategies.find(s => s.name === "Doubling and Halving");
        else strategy = operationData.strategies.find(s => s.name === "Break Apart (Distributive Property)");
    } else if (type === 'percentages') {
        if ([10, 20, 50, 25].includes(n1)) strategy = operationData.strategies.find(s => s.name === "Common Percentages");
        else strategy = operationData.strategies.find(s => s.name === "10% Method (Chunking)");
    } else if (type === 'powers') {
        if (n1 % 10 === 5) strategy = operationData.strategies.find(s => s.name === "Squaring Numbers Ending in 5");
        else strategy = operationData.strategies.find(s => s.name === "Near-Base Squaring");
    }

    if (!strategy) {
        strategy = operationData.strategies[0]; // Fallback
    }

    if (!strategy) return null;

    const example = strategy.examples[0]; // Use first example

    // Construct visual steps
    const visualSteps: VisualHintStep[] = example.steps.map((step, index) => {
        const parts = step.split(':');
        if (parts.length > 1) {
            return {
                label: parts[0].trim(),
                value: parts.slice(1).join(':').trim(),
                highlight: index === example.steps.length - 1
            };
        }
        return {
            label: `Step ${index + 1}`,
            value: step,
            highlight: index === example.steps.length - 1
        };
    });

    return {
        text: `💡 **${strategy.name}** (${strategy.alias}):\n${strategy.bestFor}\n\n**Example:** ${example.problem}\n${example.steps.join('\n')}`,
        visual: {
            type: 'vertical_breakdown',
            title: strategy.alias,
            steps: visualSteps
        }
    };
};
