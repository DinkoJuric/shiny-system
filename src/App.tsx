import { useState, useEffect } from 'react';
import { useStore } from './store';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import DeepDiagnosticScreen from './components/DeepDiagnosticScreen';
import DashboardScreen from './components/DashboardScreen';
import LessonScreen from './components/LessonScreen';
import TrainingPlanScreen from './components/TrainingPlanScreen';
import AssessmentResultScreen from './components/AssessmentResultScreen';
import type { DiagnosticReport } from './engine/DiagnosticEngine';
import { Zap, Play, LayoutDashboard, BookOpen, Target } from 'lucide-react';

import DebugMenu from './components/DebugMenu';

type Screen = 'welcome' | 'diagnostic' | 'game' | 'dashboard' | 'lesson' | 'training' | 'assessmentResult';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const { userProfile, setUserProfile, updateDailyStreak } = useStore();
  const [assessmentReport, setAssessmentReport] = useState<DiagnosticReport | null>(null);

  // Update daily streak on mount
  useEffect(() => {
    updateDailyStreak();
  }, [updateDailyStreak]);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleDiagnosticComplete = (report: { recommendedLevel: number; skillProficiency: Record<string, number> }) => {
    // Calculate XP needed for the recommended level
    const targetLevel = report.recommendedLevel;
    const xpForLevel = (targetLevel - 1) * (targetLevel - 1) * 100;

    // Calculate overall accuracy from skillProficiency
    const profValues = Object.values(report.skillProficiency);
    const overallAccuracy = profValues.length > 0
      ? profValues.reduce((a, b) => a + b, 0) / profValues.length / 100
      : 0;

    // Determine weaknesses (skills below 60%)
    const weaknesses = Object.entries(report.skillProficiency)
      .filter(([, val]) => val < 60)
      .map(([skill]) => skill);

    // Create detailed stats for AssessmentResultScreen
    const detailedStats: Record<string, { correct: number; total: number; totalTime: number }> = {};
    for (const [skill, proficiency] of Object.entries(report.skillProficiency)) {
      // Estimate from proficiency (this is approximate since we don't have raw data)
      detailedStats[skill] = {
        correct: Math.round(proficiency / 100 * 3), // Assume 3 questions per skill
        total: 3,
        totalTime: 15 // Estimate 5s per question
      };
    }

    // Create a DiagnosticReport for the results screen
    const fullReport: DiagnosticReport = {
      recommendedLevel: targetLevel,
      weaknesses,
      overallAccuracy,
      detailedStats
    };

    setUserProfile((prev) => ({
      ...prev,
      level: targetLevel,
      xp: xpForLevel,
      skillProficiency: report.skillProficiency,
      hasCompletedDiagnostic: true,
    }));
    setAssessmentReport(fullReport);
    navigateTo('assessmentResult');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-slate-100 transition-colors duration-300">
      <DebugMenu />
      <div className="w-full max-w-4xl bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden relative min-h-[600px] flex flex-col">

        {/* Header / Nav */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 pointer-events-none">
          <div
            className="flex items-center space-x-2 pointer-events-auto cursor-pointer"
            onClick={() => navigateTo('welcome')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-200">Synapse Spark</span>
          </div>

          <div className="flex space-x-2 pointer-events-auto">
            {currentScreen !== 'welcome' && (
              <>
                <button
                  onClick={() => navigateTo('game')}
                  className={`p-2 rounded-full transition-colors ${currentScreen === 'game'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  title="Practice"
                >
                  <Play className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className={`p-2 rounded-full transition-colors ${currentScreen === 'dashboard'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateTo('lesson')}
                  className={`p-2 rounded-full transition-colors ${currentScreen === 'lesson'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  title="Field Manual"
                >
                  <BookOpen className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateTo('training')}
                  className={`p-2 rounded-full transition-colors ${currentScreen === 'training'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  title="Training Plan"
                >
                  <Target className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative pt-16">
          {currentScreen === 'welcome' && (
            <WelcomeScreen
              onStart={() => navigateTo(userProfile.hasCompletedDiagnostic ? 'game' : 'diagnostic')}
              onSkipDiagnostic={() => navigateTo('game')}
              onOpenManual={() => navigateTo('lesson')}
            />
          )}
          {currentScreen === 'diagnostic' && (
            <DeepDiagnosticScreen onComplete={handleDiagnosticComplete} />
          )}
          {currentScreen === 'game' && <GameScreen />}
          {currentScreen === 'dashboard' && <DashboardScreen />}
          {currentScreen === 'lesson' && <LessonScreen onBack={() => navigateTo('welcome')} />}
          {currentScreen === 'training' && <TrainingPlanScreen onBack={() => navigateTo('welcome')} onStartTraining={() => navigateTo('game')} />}
          {currentScreen === 'assessmentResult' && assessmentReport && (
            <AssessmentResultScreen
              report={assessmentReport}
              onStartTraining={() => navigateTo('game')}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-slate-500 text-sm">Synapse Spark v1.0 (Beta)</div>
    </div>
  );
}

export default App;
