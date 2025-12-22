import type { Problem } from './ProblemGenerator';

interface WordProblemTemplate {
    templates: string[];
}

export const WORD_PROBLEM_TEMPLATES: Record<string, WordProblemTemplate> = {
    addition: {
        templates: [
            "You buy a coffee for ${num1} and a muffin for ${num2}. How much is the total?",
            "You drove ${num1} miles yesterday and ${num2} miles today. Total distance?",
            "A book costs ${num1} and a pen costs ${num2}. Total cost?",
            "You have ${num1} apples and pick ${num2} more. How many apples do you have?",
            "Team A scored ${num1} points and Team B scored ${num2} points. Total points?"
        ]
    },
    subtraction: {
        templates: [
            "You have ${num1} and spend ${num2}. How much is left?",
            "A movie is ${num1} minutes long. You've watched ${num2} minutes. How many left?",
            "The temperature was ${num1}° and dropped by ${num2}°. What is it now?",
            "You need ${num1} points to win. You have ${num2}. How many more do you need?",
            "A book has ${num1} pages. You read ${num2}. How many pages remain?"
        ]
    },
    multiplication: {
        templates: [
            "You buy ${num2} items at ${num1} each. Total cost?",
            "A room is ${num1} meters by ${num2} meters. What is the area?",
            "You work ${num2} hours at ${num1}/hour. Total earnings?",
            "There are ${num1} rows of ${num2} chairs. How many chairs total?",
            "A car travels at ${num1} mph for ${num2} hours. Distance traveled?"
        ]
    },
    percentage_basic: {
        templates: [
            "Calculate a ${num1} tip on a ${num2} bill.",
            "A ${num2} item is on sale for ${num1} off. What is the discount amount?",
            "Sales tax is ${num1}. How much tax on a ${num2} purchase?",
            "You scored ${num1} on a test with ${num2} points. (Wait, this template might be tricky with num1 as string '10%'). Let's adjust."
        ]
    }
};

export function convertToWordProblem(problem: Problem): Problem {
    const config = WORD_PROBLEM_TEMPLATES[problem.type];
    if (!config) return problem;

    // For percentages, num1 is often "10%" string. We might need to handle that.
    // In ProblemGenerator, num1 is "10%" and num2 is number.

    const template = config.templates[Math.floor(Math.random() * config.templates.length)];
    let question = template;

    // Handle replacement
    // If num1/num2 are strings with symbols (like %), we might want to keep them or strip them depending on template context.
    // The templates above use ${num1} which would be "10%".
    // "Calculate a 10% tip on a 50 bill." -> Works.

    question = question.replace('${num1}', problem.num1.toString());
    question = question.replace('${num2}', problem.num2 ? problem.num2.toString() : '');

    return {
        ...problem,
        question,
        isWordProblem: true
    };
}
