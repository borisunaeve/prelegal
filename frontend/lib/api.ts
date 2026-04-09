const API_BASE = "";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  return res;
}

export async function getMe() {
  return apiFetch("/api/auth/me");
}

export async function login(email: string, password: string) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(name: string, email: string, password: string) {
  return apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function logout() {
  return apiFetch("/api/auth/logout", { method: "POST" });
}

export async function getChatHistory() {
  return apiFetch("/api/chat/history");
}

export async function sendChatMessage(content: string) {
  return apiFetch("/api/chat/message", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function resetChat() {
  return apiFetch("/api/chat/reset", { method: "POST" });
}

export async function patchChatValues(values: Record<string, string>) {
  return apiFetch("/api/chat/values", {
    method: "PATCH",
    body: JSON.stringify({ values }),
  });
}

export async function getDocTypes() {
  return apiFetch("/api/documents/types");
}

export async function selectDocType(document_type: string) {
  return apiFetch("/api/documents/select", {
    method: "POST",
    body: JSON.stringify({ document_type }),
  });
}

export async function renderDocument(values?: Record<string, string>) {
  return apiFetch("/api/documents/render", {
    method: "POST",
    body: JSON.stringify({ values: values ?? null }),
  });
}
