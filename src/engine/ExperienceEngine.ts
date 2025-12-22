const BASE_XP = 10;
const LEVEL_CONSTANT = 100;

export interface LevelInfo {
    level: number;
    xpInLevel: number;
    xpNeeded: number;
    progressPercent: number;
}

export class ExperienceEngine {
    static calculateXP(isCorrect: boolean, timeTaken: number, difficulty: number, streak: number = 0): number {
        if (!isCorrect) return 0;

        let xp = BASE_XP * difficulty;

        // Speed Bonus
        if (timeTaken < 1.5) xp *= 2.0;
        else if (timeTaken < 2) xp *= 1.5;
        else if (timeTaken < 5) xp *= 1.2;

        // Streak Bonus (10% per streak, capped at 1000% bonus)
        const streakBonus = Math.min(streak, 1000) * 0.1;
        xp *= (1 + streakBonus);

        return Math.round(xp);
    }

    static getLevelProgress(totalXP: number): LevelInfo {
        const level = Math.floor(Math.sqrt(totalXP / LEVEL_CONSTANT)) + 1;

        const currentLevelXP = (level - 1) * (level - 1) * LEVEL_CONSTANT;
        const nextLevelXP = level * level * LEVEL_CONSTANT;

        const xpInLevel = totalXP - currentLevelXP;
        const xpNeeded = nextLevelXP - currentLevelXP;

        return {
            level,
            xpInLevel,
            xpNeeded,
            progressPercent: (xpInLevel / xpNeeded) * 100,
        };
    }
}
