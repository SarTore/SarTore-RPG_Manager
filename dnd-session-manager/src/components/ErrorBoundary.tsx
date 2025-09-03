import React from 'react';
import { useI18n } from '../lib/i18n';

const searilizeError = (error: any) => {
  if (error instanceof Error) {
    return error.message + '\n' + error.stack;
  }
  return JSON.stringify(error, null, 2);
};

interface ErrorFallbackProps {
  error: any;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
  const { t } = useI18n();
  
  return (
    <div className="p-4 border border-red-500 rounded">
      <h2 className="text-red-500">{t('somethingWentWrong')}</h2>
      <pre className="mt-2 text-sm">{searilizeError(error)}</pre>
    </div>
  );
};

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}