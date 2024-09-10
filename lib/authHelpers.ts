import { NextApiRequest, NextApiResponse } from 'next';

export async function retryableAuth(req: NextApiRequest, res: NextApiResponse, authFunction: Function, maxRetries = 3) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await authFunction(req, res);
    } catch (error) {
      console.error(`Auth attempt ${retries + 1} failed:`, error);
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
    }
  }
}