import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
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
    console.error("Uncaught error caught by Khady ErrorBoundary:", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[350px] w-full flex items-center justify-center p-6 bg-[#1A1816]/90 border border-orange-500/20 rounded-2xl text-center my-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {this.props.fallbackTitle || "Une interruption est survenue"}
            </h3>
            <p className="text-sm text-stone-300">
              Vos données sont protégées dans votre navigateur. Vous pouvez reprendre là où vous en étiez sans perdre vos informations.
            </p>
            {this.state.error?.message && (
              <div className="p-2.5 rounded bg-black/40 text-xs font-mono text-stone-400 max-h-24 overflow-y-auto text-left">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-medium rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-orange-950/40"
              >
                <RefreshCw className="w-4 h-4" />
                Reprendre en toute sécurité
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
