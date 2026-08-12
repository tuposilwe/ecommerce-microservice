import type { AuthUser } from '../types';

export function decodeAuthToken(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(json);
    if (claims.exp && Date.now() >= claims.exp * 1000) {
      return null;
    }
    return {
      id: Number(claims.sub),
      name: claims.name,
      email: claims.email,
      role: claims.role,
    };
  } catch {
    return null;
  }
}
