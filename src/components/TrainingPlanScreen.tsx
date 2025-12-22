import { useState } from 'react';
import { useStore, type TrainingPlan } from '../store';
import { MICRO_SKILLS } from '../engine/AdaptiveEngine';
import { ArrowLeft, Target, Award, X, Plus, Play } from 'lucide-react';

interface TrainingPlanScreenProps {
    onBack: () => void;
    onStartTraining: () => void;
}

const TrainingPlanScreen = ({ onBack, onStartTraining }: TrainingPlanScreenProps) => {
    const { userProfile, setTrainingPlan, toggleAutoPilot } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [planName, setPlanName] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [targetXP, setTargetXP] = useState<number>(500);
    const [targetAccuracy, setTargetAccuracy] = useState<number>(80);

    const allSkills = Object.keys(MICRO_SKILLS).map(key => ({
        key,
        name: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }));

    const handleToggleSkill = (skillKey: string) => {
        setSelectedSkills(prev =>
            prev.includes(skillKey)
                ? prev.filter(k => k !== skillKey)
                : [...prev, skillKey]
        );
    };

    const handleCreatePlan = () => {
        if (selectedSkills.length === 0 || !planName.trim()) {
            alert('Please enter a plan name and select at least one skill.');
            return;
        }

        const newPlan: TrainingPlan = {
            name: planName.trim(),
            targetSkills: selectedSkills,
            weeklyGoal: {
                targetXP,
                targetAccuracy,
            },
            startDate: new Date().toISOString().split('T')[0],
        };

        setTrainingPlan(newPlan);
        setIsCreating(false);
    };

    const handleRemovePlan = () => {
        setTrainingPlan(undefined);
    };

    if (isCreating) {
        return (
            <div className="flex-1 flex flex-col p-6 w-full max-w-4xl mx-auto animate-in fade-in">
                <div className="flex items-center mb-8">
                    <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors mr-4">
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-100">Create Training Plan</h1>
                </div>

                <div className="space-y-6">
                    {/* Plan Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Plan Name</label>
                        <input
                            type="text"
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-4 py-2 rounded-lg focus:outline-none focus:border-primary-500"
                            placeholder="e.g., Master Percentages"
                        />
                    </div>

                    {/* Weekly Goals */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Weekly XP Goal</label>
                            <input
                                type="number"
                                value={targetXP}
                                onChange={(e) => setTargetXP(parseInt(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-4 py-2 rounded-lg focus:outline-none focus:border-primary-500"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Target Accuracy (%)</label>
                            <input
                                type="number"
                                value={targetAccuracy}
                                onChange={(e) => setTargetAccuracy(parseInt(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-4 py-2 rounded-lg focus:outline-none focus:border-primary-500"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    {/* Skill Selection */}
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-3">Focus Skills ({selectedSkills.length} selected)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-900/50 rounded-lg">
                            {allSkills.map(skill => (
                                <button
                                    key={skill.key}
                                    onClick={() => handleToggleSkill(skill.key)}
                                    className={`px-3 py-2 text-sm rounded-lg transition-colors text-left ${selectedSkills.includes(skill.key)
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {skill.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleCreatePlan}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-bold transition-colors"
                    >
                        Create Plan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 w-full max-w-2xl mx-auto animate-in fade-in">
            <div className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors mr-4">
                    <ArrowLeft className="w-6 h-6 text-slate-400" />
                </button>
                <h1 className="text-2xl font-bold text-slate-100">Training Plans</h1>
            </div>

            {/* Auto-Pilot Toggle */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-100 mb-1">Auto-Pilot Mode</h3>
                        <p className="text-sm text-slate-400">Automatically increases difficulty when you answer 3 consecutive problems correctly in under 2 seconds.</p>
                    </div>
                    <button
                        onClick={toggleAutoPilot}
                        className={`ml-4 px-6 py-3 rounded-lg font-bold transition-colors ${userProfile.autoPilotEnabled
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-700 text-slate-400'
                            }`}
                    >
                        {userProfile.autoPilotEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                </div>
            </div>

            {/* Active Plan */}
            {userProfile.activePlan ? (
                <div className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/30 rounded-xl p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                                <Target className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-100">{userProfile.activePlan.name}</h3>
                                <p className="text-sm text-slate-400">Started {new Date(userProfile.activePlan.startDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRemovePlan}
                            className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
                            title="Remove plan"
                        >
                            <X className="w-5 h-5 text-red-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {userProfile.activePlan.weeklyGoal?.targetXP && (
                            <div className="bg-slate-900/50 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Weekly XP Goal</div>
                                <div className="text-2xl font-bold text-primary-400">{userProfile.activePlan.weeklyGoal.targetXP}</div>
                            </div>
                        )}
                        {userProfile.activePlan.weeklyGoal?.targetAccuracy && (
                            <div className="bg-slate-900/50 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Target Accuracy</div>
                                <div className="text-2xl font-bold text-green-400">{userProfile.activePlan.weeklyGoal.targetAccuracy}%</div>
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Focus Skills ({userProfile.activePlan.targetSkills.length})</div>
                        <div className="flex flex-wrap gap-2">
                            {userProfile.activePlan.targetSkills.slice(0, 10).map(skillKey => (
                                <span key={skillKey} className="px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded">
                                    {skillKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </span>
                            ))}
                            {userProfile.activePlan.targetSkills.length > 10 && (
                                <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded">
                                    +{userProfile.activePlan.targetSkills.length - 10} more
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => onStartTraining()}
                        className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2"
                    >
                        <Play className="w-5 h-5" />
                        <span>Start Training Now</span>
                    </button>
                </div>
            ) : (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center mb-6">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-300 mb-2">No Active Plan</h3>
                    <p className="text-sm text-slate-500 mb-6">Create a custom training plan to focus on specific skills and track weekly goals.</p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-bold transition-colors inline-flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New Plan</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default TrainingPlanScreen;
