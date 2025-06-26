
import logger from './logger';
import { supabase } from './supabase';

// Generic response type
interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

// API request options
interface ApiRequestOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  tags?: string[];
}

// Default options
const defaultOptions: ApiRequestOptions = {
  retries: 2,
  retryDelay: 1000,
  timeout: 15000,
  tags: []
};

/**
 * Enhanced API client with retries and improved error handling
 */
export const apiClient = {
  // Fetch data from Supabase with retries
  async fetch<T>(
    tableName: string,
    query: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const opts = { ...defaultOptions, ...options };
    let attempts = 0;
    
    const executeQuery = async (): Promise<ApiResponse<T>> => {
      try {
        attempts++;
        logger.debug(`Fetching data from ${tableName} (attempt ${attempts})`, {
          context: 'apiClient',
          tags: ['supabase', 'fetch', ...opts.tags]
        });
        
        // Execute the query
        const response = await query;
        
        if (response.error) {
          // Check if it's a token expiration error
          if (response.error.status === 401) {
            logger.warn('Auth token expired, attempting refresh', {
              context: 'apiClient'
            });
            
            // Try to refresh the session
            const { data } = await supabase.auth.refreshSession();
            
            if (data.session) {
              logger.info('Session refreshed successfully, retrying request', {
                context: 'apiClient'
              });
              
              // Retry the request with the new token
              return executeQuery();
            }
          }
          
          throw response.error;
        }
        
        logger.debug(`Successfully fetched data from ${tableName}`, {
          context: 'apiClient',
          tags: ['success', ...opts.tags]
        });
        
        return {
          data: response.data as T,
          error: null
        };
      } catch (error: any) {
        logger.error(`Failed to fetch from ${tableName} (attempt ${attempts}/${opts.retries + 1})`, error, {
          context: 'apiClient',
          tags: ['error', ...opts.tags]
        });
        
        // Retry if we haven't exceeded the retry limit
        if (attempts <= opts.retries!) {
          logger.info(`Retrying in ${opts.retryDelay}, ms...`, {
            context: 'apiClient'
          });
          
          await new Promise((resolve) => setTimeout(resolve, opts.retryDelay));
          return executeQuery();
        }
        
        // We've exhausted our retries
        return {
          data: null,
          error: new Error(`Failed to fetch data from ${tableName} after ${attempts} attempts: ${error.message}`)
        };
      }
    };
    
    return executeQuery();
  }
};

export default apiClient;
