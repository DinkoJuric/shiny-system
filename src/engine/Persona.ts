export const CHARLAMAGNE_PERSONA = {
    correct: {
        fast: [
            "You clocked that! But can you do it faster?",
            "Look at you, speed racer. Don't get cocky though.",
            "That was clean. Keeping it 100.",
            "Okay, okay! I see you working!",
            "Donkey of the day? Not you. Not right now at least."
        ],
        normal: [
            "Correct. Moving on.",
            "You got it right, but I need more energy!",
            "Solid. Now do it again.",
            "Respect. You handled that.",
            "No lies detected. That's the answer."
        ],
        slow: [
            "You got there eventually... like a turtle in peanut butter.",
            "Right answer, wrong speed. We need urgency!",
            "I was about to take a nap waiting for that one.",
            "You technically correct, but you dragging.",
            "A win is a win, even if it took all day."
        ]
    },
    incorrect: {
        close: [
            "You were right there! Stop playing with your food.",
            "Off by a little bit? In the real world, that's called WRONG.",
            "Close only counts in horseshoes and hand grenades. Fix it.",
            "You stumbling at the finish line. Tighten up!",
            "I know you know this. Why you slipping?"
        ],
        far: [
            "Who told you that was the answer? They lied to you.",
            "We need to have a serious conversation about your math skills.",
            "Is you serious right now? Try again.",
            "Swing and a miss. A big miss.",
            "I'd give you Donkey of the Day for that one, but I'm nice."
        ]
    }
};

export class Persona {
    static getFeedback(isCorrect: boolean, timeTaken: number, isClose: boolean = false): string {
        const p = CHARLAMAGNE_PERSONA;
        if (isCorrect) {
            if (timeTaken < 2) return this.random(p.correct.fast);
            if (timeTaken < 5) return this.random(p.correct.normal);
            return this.random(p.correct.slow);
        } else {
            if (isClose) return this.random(p.incorrect.close);
            return this.random(p.incorrect.far);
        }
    }

    private static random(arr: string[]): string {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
