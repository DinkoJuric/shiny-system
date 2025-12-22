import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../utils/logger';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error('Uncaught error:', { error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
                    <div className="max-w-md w-full bg-slate-800 p-6 rounded-lg shadow-xl border border-red-500/50">
                        <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
                        <p className="text-slate-300 mb-4">
                            The application encountered an unexpected error.
                        </p>
                        <div className="bg-slate-900 p-4 rounded border border-slate-700 overflow-auto max-h-48 mb-6">
                            <code className="text-xs text-red-300">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-2 bg-primary-600 hover:bg-primary-700 rounded font-medium transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
