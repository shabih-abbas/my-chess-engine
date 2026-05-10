import React from 'react';
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export function ErrorBoundaryPage() {
  return (
    <main className="min-h-screen bg-chess-board flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="glass-panel w-full max-w-lg p-10 text-center shadow-2xl border-white/20 relative overflow-hidden">
        
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-chess-gold/5 blur-3xl rounded-full" />
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/20 rounded-full border border-red-500/30">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-chess-gold mb-4 uppercase tracking-widest">
          Unexpected Error
        </h2>
        
        <div className="bg-black/40 rounded-lg p-6 mb-8 border border-white/10 text-center">
          <p className="text-white/80 text-sm leading-relaxed">
            The application encountered a technical glitch. Please try refreshing the page or return to the safety of the main dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => window.location.reload()}
            className="btn-gold flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-bold uppercase tracking-widest text-sm transition-transform active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>

          <a
            href="/"
            className="bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-bold uppercase tracking-widest text-sm text-white transition-all no-underline"
          >
            <Home className="w-4 h-4" />
            Home
          </a>
        </div>

        <p className="mt-10 text-white/20 text-[10px] uppercase tracking-[0.3em] font-medium">
          System Integrity Check Failed
        </p>
      </div>
    </main>
  );
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log error to an error reporting service
    console.error('Error caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryPage />
    }
    return this.props.children;
  }
}