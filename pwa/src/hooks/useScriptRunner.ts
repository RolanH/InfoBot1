import { useState, useCallback } from 'react';
import { agentApi } from '@/services/agentApi';
import { ScriptExecutionState, ScriptResult, ApiError } from '@/types/agent.types';

export function useScriptRunner() {
  const [state, setState] = useState<ScriptExecutionState>({
    isExecuting: false,
  });

  const executeScript = useCallback(async (): Promise<ScriptResult | null> => {
    if (state.isExecuting) {
      throw new Error('Script is already executing');
    }

    setState({
      isExecuting: true,
      startTime: Date.now(),
      result: undefined,
      error: undefined,
    });

    try {
      const result = await agentApi.runScript();
      
      setState({
        isExecuting: false,
        result,
        error: undefined,
        startTime: undefined,
      });

      return result;
    } catch (error) {
      const apiError: ApiError = {
        code: 'SCRIPT_EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      };

      setState({
        isExecuting: false,
        result: undefined,
        error: apiError,
        startTime: undefined,
      });

      throw error;
    }
  }, [state.isExecuting]);

  const clearResult = useCallback(() => {
    setState({
      isExecuting: false,
      result: undefined,
      error: undefined,
      startTime: undefined,
    });
  }, []);

  const getExecutionDuration = useCallback((): number | null => {
    if (!state.startTime) return null;
    if (state.isExecuting) {
      return Date.now() - state.startTime;
    }
    return state.result?.durationMs || null;
  }, [state.startTime, state.isExecuting, state.result]);

  return {
    state,
    executeScript,
    clearResult,
    getExecutionDuration,
    isExecuting: state.isExecuting,
    result: state.result,
    error: state.error,
  };
} 