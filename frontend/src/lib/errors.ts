import { isAxiosError } from 'axios';

export function extractFieldErrors(error: unknown): Record<string, string> {
  if (isAxiosError(error) && error.response?.status === 400 && typeof error.response.data === 'object') {
    return error.response.data as Record<string, string>;
  }
  return {};
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? fallback;
  }
  return fallback;
}
