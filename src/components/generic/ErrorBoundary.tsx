import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black-darker flex items-center justify-center p-4">
          <div className="bg-black-dark border border-red-500 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-red-500 text-xl font-bold mb-4">
              Something went wrong
            </h2>
            <p className="text-white-light mb-4">
              An unexpected error occurred. Please refresh the page and try
              again.
            </p>
            <details className="mb-4">
              <summary className="text-white-dark cursor-pointer">
                Error details
              </summary>
              <pre className="text-xs text-white-darker mt-2 overflow-auto">
                {this.state.error?.message}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
