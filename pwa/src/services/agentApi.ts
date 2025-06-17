import {
  ScriptResult,
  VersionInfo,
  TokenInfo,
  HealthStatus,
  ApiError,
} from '@/types/agent.types';

export class AgentApiClient {
  private baseUrl = 'http://127.0.0.1:3210';
  private token: string | null = null;
  private readonly timeout = 5000; // 5 seconds

  constructor() {
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    try {
      this.token = localStorage.getItem('infobot-agent-token');
    } catch (error) {
      console.warn('Failed to load token from storage:', error);
    }
  }

  private saveTokenToStorage(token: string): void {
    try {
      localStorage.setItem('infobot-agent-token', token);
      this.token = token;
    } catch (error) {
      console.warn('Failed to save token to storage:', error);
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          code: 'HTTP_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      throw new Error(`${errorData.code}: ${errorData.message}`);
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error('Invalid JSON response');
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/health`);
      return await this.handleResponse<HealthStatus>(response);
    } catch (error) {
      throw new Error(
        `Agent health check failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async getVersion(): Promise<VersionInfo> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/version`);
      return await this.handleResponse<VersionInfo>(response);
    } catch (error) {
      throw new Error(
        `Failed to get agent version: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async getToken(): Promise<string> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/token`);
      const tokenInfo = await this.handleResponse<TokenInfo>(response);
      this.saveTokenToStorage(tokenInfo.token);
      return tokenInfo.token;
    } catch (error) {
      throw new Error(
        `Failed to get authentication token: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async runScript(): Promise<ScriptResult> {
    if (!this.token) {
      try {
        await this.getToken();
      } catch (error) {
        throw new Error('Authentication required but token unavailable');
      }
    }

    if (!this.token) {
      throw new Error('No authentication token available');
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Agent-Token': this.token,
        },
      });

      return await this.handleResponse<ScriptResult>(response);
    } catch (error) {
      // If authentication fails, try to get a new token once
      if (
        error instanceof Error &&
        (error.message.includes('INVALID_TOKEN') ||
          error.message.includes('MISSING_TOKEN'))
      ) {
        try {
          await this.getToken();
          if (!this.token) {
            throw new Error('Failed to refresh authentication token');
          }

          const retryResponse = await this.fetchWithTimeout(
            `${this.baseUrl}/run`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Agent-Token': this.token,
              },
            }
          );

          return await this.handleResponse<ScriptResult>(retryResponse);
        } catch (retryError) {
          throw new Error(
            `Script execution failed after token refresh: ${
              retryError instanceof Error ? retryError.message : 'Unknown error'
            }`
          );
        }
      }

      throw new Error(
        `Script execution failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async isAgentOnline(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  clearToken(): void {
    this.token = null;
    try {
      localStorage.removeItem('infobot-agent-token');
    } catch (error) {
      console.warn('Failed to clear token from storage:', error);
    }
  }
}

export const agentApi = new AgentApiClient(); 