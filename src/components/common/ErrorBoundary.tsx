import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../utils/logger';

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
        logger.error('Uncaught error in React component:', error);
        logger.error('Component stack:', errorInfo.componentStack);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4">
                    <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-xl p-8 border border-red-900/50">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h1>
                        <p className="text-slate-300 mb-6">
                            Our mental math engine encountered an unexpected calculation error. The architects have been notified.
                        </p>
                        {this.state.error && import.meta.env.DEV && (
                            <pre className="bg-slate-950 p-4 rounded text-xs text-red-300 overflow-auto mb-6">
                                {this.state.error.toString()}
                            </pre>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                        >
                            Refresh Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
