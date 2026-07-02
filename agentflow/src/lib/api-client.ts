const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function getTokens() {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: localStorage.getItem("af_access"),
    refresh: localStorage.getItem("af_refresh"),
  };
}

function saveTokens(access: string, refresh: string) {
  localStorage.setItem("af_access", access);
  localStorage.setItem("af_refresh", refresh);
}

export function clearTokens() {
  localStorage.removeItem("af_access");
  localStorage.removeItem("af_refresh");
}

async function tryRefresh(): Promise<boolean> {
  const { refresh } = getTokens();
  if (!refresh) return false;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!res.ok) {
    clearTokens();
    return false;
  }

  const data = await res.json();
  saveTokens(data.access_token, data.refresh_token);
  return true;
}

async function request<T>(path: string, options: RequestInit = {}, retry = true, skipContentType = false): Promise<T> {
  const { access } = getTokens();
  const headers: Record<string, string> = {
    ...(skipContentType ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };
  if (access) headers["Authorization"] = `Bearer ${access}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, false, skipContentType);
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError(401, "Session expirée, reconnectez-vous.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Erreur inconnue" }));
    throw new ApiError(res.status, body.detail ?? "Erreur inconnue");
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }, true, true),
  saveTokens,
};
