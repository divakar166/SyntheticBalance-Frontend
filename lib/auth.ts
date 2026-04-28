import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  assertSupabaseConfigured,
} from "./config";

const SESSION_KEY = "synthetic-data-auth-session";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

interface SupabaseAuthResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email?: string;
  };
  error?: string;
  error_description?: string;
  msg?: string;
}

function authHeaders(accessToken?: string) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

function toSession(payload: SupabaseAuthResponse): AuthSession {
  if (!payload.access_token || !payload.refresh_token || !payload.user?.id) {
    throw new Error(
      payload.error_description || payload.msg || "Supabase auth failed.",
    );
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() + (payload.expires_in || 3600) * 1000,
    user: {
      id: payload.user.id,
      email: payload.user.email || "",
    },
  };
}

async function authRequest(path: string, body: Record<string, unknown>) {
  assertSupabaseConfigured();
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as SupabaseAuthResponse;
  if (!response.ok) {
    throw new Error(
      payload.error_description ||
        payload.msg ||
        payload.error ||
        "Auth request failed.",
    );
  }
  return payload;
}

export function saveSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    clearSession();
    return null;
  }
}

export async function signInWithPassword(email: string, password: string) {
  const payload = await authRequest("token?grant_type=password", {
    email,
    password,
  });
  const session = toSession(payload);
  saveSession(session);
  return session;
}

export async function signUpWithPassword(email: string, password: string) {
  const payload = await authRequest("signup", {
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/login` },
  });
  if (!payload.access_token) {
    return null;
  }
  const session = toSession(payload);
  saveSession(session);
  return session;
}

export async function refreshAuthSession(session: AuthSession) {
  const payload = await authRequest("token?grant_type=refresh_token", {
    refresh_token: session.refreshToken,
  });
  const nextSession = toSession(payload);
  saveSession(nextSession);
  return nextSession;
}

export async function signOut(session: AuthSession | null) {
  if (!session) {
    clearSession();
    return;
  }

  try {
    assertSupabaseConfigured();
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: authHeaders(session.accessToken),
    });
  } finally {
    clearSession();
  }
}

export async function getFreshSession() {
  const session = readStoredSession();
  if (!session) return null;

  if (Date.now() < session.expiresAt - 60_000) {
    return session;
  }

  try {
    return await refreshAuthSession(session);
  } catch {
    clearSession();
    return null;
  }
}
