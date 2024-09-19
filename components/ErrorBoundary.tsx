// components/ErrorBoundary.tsx
// This is a simple error boundary component that catches errors in its children and displays an error message. It also provides a button to reload the page.
//
"use client";

import React, { Component, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode; // Define children prop
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  reloadPage = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <Button onClick={this.reloadPage}>Reload</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
// Usage:
// <ErrorBoundary>
//   <MyComponent />
// </ErrorBoundary>
