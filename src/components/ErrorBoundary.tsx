import React, { Component, ErrorInfo, ReactNode } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// HOC to handle role-based UI rendering
function withPermissions(WrappedComponent: typeof ErrorBoundaryBase) {
  return function WithPermissionsComponent(props: Props) {
    const { isSchoolAdmin } = usePermissions();
    return <WrappedComponent isSchoolAdmin={isSchoolAdmin} {...props} />;
  };
}

// Base ErrorBoundary without permissions
class ErrorBoundaryBase extends Component<Props & { isSchoolAdmin?: boolean }, State> {
  constructor(props: Props & { isSchoolAdmin?: boolean }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // If using custom fallback from props, use it regardless of role
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // For school admin, show limited error UI
      if (this.props.isSchoolAdmin) {
        return (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg">
            <h2 className="text-md font-medium mb-1">Sistemdə xəta baş verdi</h2>
            <p className="text-xs">
              Zəhmət olmasa, sistem administratoruna müraciət edin.
            </p>
            <button
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-xs"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Yenidən cəhd edin
            </button>
          </div>
        );
      }
      
      // For other roles, show detailed error UI
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export the wrapped component
const ErrorBoundary = withPermissions(ErrorBoundaryBase);
export default ErrorBoundary;
