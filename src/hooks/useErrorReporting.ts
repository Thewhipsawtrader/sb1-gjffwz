import { useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ErrorReporter } from '../services/errorReporter';
import { ErrorCategory, ErrorContext } from '../types/errors';

export function useErrorReporting() {
  const { user } = useUser();

  const reportError = useCallback(
    (
      error: Error,
      category: ErrorCategory,
      additionalContext?: Partial<ErrorContext>
    ) => {
      const context: ErrorContext = {
        userId: user?.id,
        userRole: user?.publicMetadata?.role as string,
        ...additionalContext,
      };

      ErrorReporter.getInstance().reportError({
        category,
        message: error.message,
        context,
        stackTrace: error.stack,
      });
    },
    [user]
  );

  return { reportError };
}