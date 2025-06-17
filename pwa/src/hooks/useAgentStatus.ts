import { useState, useEffect, useCallback } from 'react';
import { agentApi } from '@/services/agentApi';
import { AgentStatus } from '@/types/agent.types';

export function useAgentStatus() {
  const [status, setStatus] = useState<AgentStatus>({
    isOnline: false,
    isConnected: false,
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkAgentStatus = useCallback(async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      const health = await agentApi.healthCheck();
      const version = await agentApi.getVersion();
      
      setStatus({
        isOnline: true,
        isConnected: true,
        lastPing: Date.now(),
        version: version.version,
        error: undefined,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setStatus({
        isOnline: false,
        isConnected: false,
        lastPing: Date.now(),
        error: errorMessage,
      });
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  const refreshStatus = useCallback(() => {
    checkAgentStatus();
  }, [checkAgentStatus]);

  // Initial check and periodic polling
  useEffect(() => {
    checkAgentStatus();
    
    // Poll every 30 seconds when online, every 10 seconds when offline
    const pollInterval = status.isOnline ? 30000 : 10000;
    const intervalId = setInterval(checkAgentStatus, pollInterval);
    
    return () => clearInterval(intervalId);
  }, [checkAgentStatus, status.isOnline]);

  // Check when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (!isChecking) {
        checkAgentStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkAgentStatus, isChecking]);

  return {
    status,
    isChecking,
    refreshStatus,
  };
} 