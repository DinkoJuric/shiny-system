import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionRecord {
    date: string;           // ISO date (YYYY-MM-DD)
    problemsSolved: number;
    accuracy: number;       // 0-100
    avgSpeed: number;       // seconds per problem
    xpEarned: number;
}

export interface TrainingPlan {
    name: string;
    targetSkills: string[];  // Array of skill keys to prioritize
    weeklyGoal?: {
        targetXP?: number;
        targetAccuracy?: number;  // 0-100
        targetProblems?: number;
    };
    startDate: string;  // ISO date
    endDate?: string;   // ISO date (optional)
}

export interface UserProfile {
    name: string;
    level: number;
    xp: number;
    stats: Record<string, any>;
    skillProficiency: Record<string, number>; // 0 to 100
    hasCompletedDiagnostic: boolean;
    lastPlayedDate?: string;  // ISO date string (YYYY-MM-DD)
    currentStreak: number;
    longestStreak: number;
    sessionHistory: SessionRecord[];
    activePlan?: TrainingPlan;  // Custom training plan
    autoPilotEnabled: boolean;  // Auto-adjust difficulty mid-session
    visualHintsEnabled?: boolean; // Display hints visually
}

interface AppState {
    userProfile: UserProfile;
    setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    updateXP: (xp: number) => void;
    updateSkillProficiency: (skillKey: string, delta: number) => void;
    addSessionRecord: (record: Omit<SessionRecord, 'date'>) => void;
    updateDailyStreak: () => void;
    setTrainingPlan: (plan: TrainingPlan | undefined) => void;
    toggleAutoPilot: () => void;
    toggleVisualHints: () => void;
    resetProgress: () => void;
}

export const useStore = create<AppState>()(persist(
    (set) => ({
        userProfile: {
            name: 'Player',
            level: 1,
            xp: 0,
            stats: {},
            skillProficiency: {},
            hasCompletedDiagnostic: false,
            currentStreak: 0,
            longestStreak: 0,
            sessionHistory: [],
            autoPilotEnabled: false,
            visualHintsEnabled: false,
        },
        setUserProfile: (profile) =>
            set((state) => ({
                userProfile: typeof profile === 'function' ? profile(state.userProfile) : profile,
            })),
        updateProfile: (updates) =>
            set((state) => ({
                userProfile: { ...state.userProfile, ...updates }
            })),
        updateXP: (xpGained) =>
            set((state) => {
                const newXP = state.userProfile.xp + xpGained;
                // Calculate level from XP: level = floor(sqrt(xp/100)) + 1
                const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
                return {
                    userProfile: {
                        ...state.userProfile,
                        xp: newXP,
                        level: newLevel, // Auto-sync level with XP
                    },
                };
            }),
        updateSkillProficiency: (skillKey, delta) =>
            set((state) => {
                const current = state.userProfile.skillProficiency[skillKey] || 0;
                const newScore = Math.min(100, Math.max(0, current + delta)); // Clamp 0-100
                return {
                    userProfile: {
                        ...state.userProfile,
                        skillProficiency: {
                            ...state.userProfile.skillProficiency,
                            [skillKey]: newScore
                        }
                    }
                };
            }),
        addSessionRecord: (record) =>
            set((state) => {
                const today = new Date().toISOString().split('T')[0];
                const newRecord: SessionRecord = { ...record, date: today };

                // Keep only last 30 days
                const updatedHistory = [...state.userProfile.sessionHistory, newRecord]
                    .slice(-30);

                return {
                    userProfile: {
                        ...state.userProfile,
                        sessionHistory: updatedHistory,
                    },
                };
            }),
        updateDailyStreak: () =>
            set((state) => {
                const today = new Date().toISOString().split('T')[0];
                const lastPlayed = state.userProfile.lastPlayedDate;

                let newStreak = state.userProfile.currentStreak;

                if (lastPlayed === today) {
                    // Already played today, no change
                    return state;
                }

                if (!lastPlayed) {
                    // First time playing
                    newStreak = 1;
                } else {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (lastPlayed === yesterdayStr) {
                        // Played yesterday, increment streak
                        newStreak = state.userProfile.currentStreak + 1;
                    } else {
                        // Gap in playing, reset streak
                        newStreak = 1;
                    }
                }

                const newLongest = Math.max(newStreak, state.userProfile.longestStreak);

                return {
                    userProfile: {
                        ...state.userProfile,
                        lastPlayedDate: today,
                        currentStreak: newStreak,
                        longestStreak: newLongest,
                    },
                };
            }),
        setTrainingPlan: (plan) =>
            set((state) => ({
                userProfile: {
                    ...state.userProfile,
                    activePlan: plan,
                },
            })),
        toggleAutoPilot: () =>
            set((state) => ({
                userProfile: {
                    ...state.userProfile,
                    autoPilotEnabled: !state.userProfile.autoPilotEnabled,
                },
            })),
        toggleVisualHints: () =>
            set((state) => ({
                userProfile: {
                    ...state.userProfile,
                    visualHintsEnabled: !state.userProfile.visualHintsEnabled,
                },
            })),
        resetProgress: () =>
            set(() => ({
                userProfile: {
                    name: 'Player',
                    level: 1,
                    xp: 0,
                    stats: {},
                    skillProficiency: {},
                    hasCompletedDiagnostic: false,
                    currentStreak: 0,
                    longestStreak: 0,
                    sessionHistory: [],
                    autoPilotEnabled: false,
                    visualHintsEnabled: false,
                },
            })),
    }),
    {
        name: 'synapse-spark-storage',
        version: 1,
    }
));
