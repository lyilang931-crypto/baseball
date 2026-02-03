"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { reportError } from "@/lib/error-handler";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * React Error Boundary
 * コンポーネントツリー内のJSエラーをキャッチしてフォールバックUIを表示
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラーをログに送信
    reportError(error, {
      componentStack: errorInfo.componentStack,
      source: "ErrorBoundary",
    });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-6">
              申し訳ありません。予期しないエラーが発生しました。
            </p>
            <button
              onClick={this.handleRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
