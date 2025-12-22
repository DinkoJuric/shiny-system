import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { logger } from '../utils/logger';
import { X, Terminal, Database, Bug, RotateCcw, Wrench } from 'lucide-react';

const DebugMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'state' | 'logs' | 'actions'>('state');
    const userProfile = useStore(state => state.userProfile);
    const resetProgress = useStore(state => state.resetProgress);
    const [logs, setLogs] = useState(logger.getLogs());

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        if (isOpen && activeTab === 'logs') {
            const interval = setInterval(() => {
                setLogs([...logger.getLogs()]);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isOpen, activeTab]);

    const handleResetProgress = () => {
        if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
            resetProgress();
            logger.warn('User progress reset via Debug Console');
            alert('Progress has been reset!');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
                    <div className="flex items-center space-x-2">
                        <Bug className="w-5 h-5 text-red-400" />
                        <h2 className="font-bold text-slate-200">Debug Console</h2>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700 bg-slate-800/50">
                    <button
                        onClick={() => setActiveTab('state')}
                        className={`px-4 py-2 flex items-center space-x-2 ${activeTab === 'state' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Database className="w-4 h-4" />
                        <span>State</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-2 flex items-center space-x-2 ${activeTab === 'logs' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Terminal className="w-4 h-4" />
                        <span>Logs</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('actions')}
                        className={`px-4 py-2 flex items-center space-x-2 ${activeTab === 'actions' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Wrench className="w-4 h-4" />
                        <span>Actions</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                    {activeTab === 'state' && (
                        <pre className="text-green-400">
                            {JSON.stringify(userProfile, null, 2)}
                        </pre>
                    )}
                    {activeTab === 'logs' && (
                        <div className="space-y-1">
                            {logs.length === 0 && (
                                <p className="text-slate-500">No logs yet. Interact with the app to generate logs.</p>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className="border-b border-slate-800 pb-1">
                                    <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                    <span className={`ml-2 font-bold ${log.level === 'error' ? 'text-red-400' :
                                        log.level === 'warn' ? 'text-yellow-400' :
                                            log.level === 'debug' ? 'text-slate-400' : 'text-blue-400'
                                        }`}>
                                        {log.level.toUpperCase()}
                                    </span>
                                    <span className="ml-2 text-slate-300">{log.message}</span>
                                    {log.data && (
                                        <pre className="ml-8 text-xs text-slate-500 mt-1">
                                            {JSON.stringify(log.data, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'actions' && (
                        <div className="space-y-4">
                            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                <h3 className="text-lg font-bold text-slate-200 mb-2">Reset Progress</h3>
                                <p className="text-sm text-slate-400 mb-4">
                                    This will reset ALL user data including XP, level, skill proficiency, session history, and settings.
                                </p>
                                <button
                                    onClick={handleResetProgress}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span>Reset All Progress</span>
                                </button>
                            </div>

                            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                <h3 className="text-lg font-bold text-slate-200 mb-2">Quick Actions</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => { logger.clear(); setLogs([]); }}
                                        className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm"
                                    >
                                        Clear Logs
                                    </button>
                                    <button
                                        onClick={() => logger.info('Manual test log entry')}
                                        className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm"
                                    >
                                        Add Test Log
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DebugMenu;

