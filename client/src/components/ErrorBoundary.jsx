import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Render crash:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <pre className="m-4 overflow-auto whitespace-pre-wrap rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive">
          {this.state.error.message}
          {'\n\n'}
          {this.state.error.stack}
        </pre>
      );
    }
    return this.props.children;
  }
}
