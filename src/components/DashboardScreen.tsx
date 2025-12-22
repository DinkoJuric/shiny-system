import { useStore } from '../store';
import { ExperienceEngine } from '../engine/ExperienceEngine';
import { Network, Activity, Flame, TrendingUp, Award } from 'lucide-react';

const DashboardScreen = () => {
    const { userProfile, toggleAutoPilot, toggleVisualHints } = useStore();
    const levelInfo = ExperienceEngine.getLevelProgress(userProfile.xp || 0);

    // Get top 5 skills by proficiency
    const topSkills = Object.entries(userProfile.skillProficiency || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([key, value]) => ({
            id: key,
            name: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            proficiency: value
        }));

    // Get last 7 days of session history
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
    });

    const sessionData = last7Days.map(date => {
        const dayRecords = userProfile.sessionHistory?.filter(s => s.date === date) || [];
        const totalXP = dayRecords.reduce((sum, r) => sum + r.xpEarned, 0);
        const avgAccuracy = dayRecords.length > 0
            ? dayRecords.reduce((sum, r) => sum + r.accuracy, 0) / dayRecords.length
            : 0;
        return {
            date,
            xp: totalXP,
            accuracy: avgAccuracy,
            label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
        };
    });

    const maxXP = Math.max(...sessionData.map(d => d.xp), 1);

    return (
        <div className="flex-1 flex flex-col p-8 animate-in overflow-y-auto">
            <h2 className="text-3xl font-bold text-slate-100 mb-8">Neural Dashboard</h2>

            {/* Profile Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {userProfile.name.charAt(0)}
                </div>
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-2xl font-bold text-slate-200">{userProfile.name}</h3>
                        <span className="text-primary-400 font-mono">Level {levelInfo.level}</span>
                    </div>
                    <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-1000"
                            style={{ width: `${levelInfo.progressPercent}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>{Math.round(levelInfo.xpInLevel)} XP</span>
                        <span>{Math.round(levelInfo.xpNeeded)} XP to next level</span>
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <h4 className="text-slate-200 font-medium">Auto-Pilot Mode</h4>
                        <p className="text-xs text-slate-500">Automatically increase difficulty</p>
                    </div>
                    <button
                        onClick={toggleAutoPilot}
                        className={`w-12 h-6 rounded-full transition-colors relative ${userProfile.autoPilotEnabled ? 'bg-primary-500' : 'bg-slate-600'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${userProfile.autoPilotEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <h4 className="text-slate-200 font-medium">Visual Hints Mode</h4>
                        <p className="text-xs text-slate-500">Show step-by-step visual breakdowns</p>
                    </div>
                    <button
                        onClick={toggleVisualHints}
                        className={`w-12 h-6 rounded-full transition-colors relative ${userProfile.visualHintsEnabled ? 'bg-primary-500' : 'bg-slate-600'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${userProfile.visualHintsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {/* Streak Section */}
            {userProfile.currentStreak > 0 && (
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
                                <Flame className={`w-8 h-8 ${userProfile.currentStreak > 2 ? 'text-orange-500 animate-pulse' : 'text-orange-400'}`} />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-orange-400">{userProfile.currentStreak} Day{userProfile.currentStreak > 1 ? 's' : ''}</div>
                                <div className="text-sm text-slate-400">Current Streak</div>
                            </div>
                        </div>
                        {userProfile.longestStreak > userProfile.currentStreak && (
                            <div className="text-right">
                                <div className="text-lg font-bold text-slate-400">{userProfile.longestStreak}</div>
                                <div className="text-xs text-slate-500">Best Streak</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* XP Progress Chart */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-slate-300 mb-4 flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>7-Day XP Progress</span>
                    </h4>
                    <div className="flex items-end space-x-2 h-32">
                        {sessionData.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center space-y-1">
                                <div className="w-full relative" style={{ height: '80px' }}>
                                    <div
                                        className="absolute bottom-0 w-full bg-primary-500 rounded-t transition-all duration-500 hover:bg-primary-400"
                                        style={{ height: `${(day.xp / maxXP) * 100}%` }}
                                        title={`${day.xp} XP`}
                                    ></div>
                                </div>
                                <span className="text-xs text-slate-500">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Accuracy Trend */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-slate-300 mb-4 flex items-center space-x-2">
                        <Award className="w-5 h-5" />
                        <span>7-Day Accuracy</span>
                    </h4>
                    <div className="flex items-end space-x-2 h-32">
                        {sessionData.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center space-y-1">
                                <div className="w-full relative" style={{ height: '80px' }}>
                                    <div
                                        className={`absolute bottom-0 w-full rounded-t transition-all duration-500 ${day.accuracy >= 80 ? 'bg-green-500 hover:bg-green-400' :
                                            day.accuracy >= 60 ? 'bg-yellow-500 hover:bg-yellow-400' :
                                                day.accuracy > 0 ? 'bg-red-500 hover:bg-red-400' : 'bg-slate-700'
                                            }`}
                                        style={{ height: `${day.accuracy}%` }}
                                        title={`${Math.round(day.accuracy)}%`}
                                    ></div>
                                </div>
                                <span className="text-xs text-slate-500">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Skills */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-slate-300 mb-4 flex items-center space-x-2">
                        <Network className="w-5 h-5" />
                        <span>Top Skills</span>
                    </h4>
                    {topSkills.length > 0 ? (
                        <div className="space-y-4">
                            {topSkills.map((skill) => (
                                <div key={skill.id} className="group">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                                            {skill.name}
                                        </span>
                                        <span className="text-slate-500">
                                            {Math.round(skill.proficiency)}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 rounded-full transition-all duration-500"
                                            style={{ width: `${skill.proficiency}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">Complete the diagnostic to see your skill breakdown.</p>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-slate-300 mb-4 flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Recent Sessions</span>
                    </h4>
                    {userProfile.sessionHistory && userProfile.sessionHistory.length > 0 ? (
                        <div className="space-y-3">
                            {userProfile.sessionHistory.slice(-5).reverse().map((session, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between text-sm p-2 hover:bg-slate-700/30 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${session.accuracy >= 80 ? 'bg-green-500' : session.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                        <span className="text-slate-400">{session.problemsSolved} problems</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-400 text-xs">{Math.round(session.accuracy)}% accuracy</div>
                                        <div className="text-slate-600 text-xs">{new Date(session.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">No session data yet. Complete a training session to see your history!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;
