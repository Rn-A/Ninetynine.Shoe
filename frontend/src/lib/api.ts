/** Base URL backend untuk file upload/media (bukan untuk fetch API). */
const MEDIA_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export function getUploadUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url.startsWith("/") ? `${MEDIA_BASE}${url}` : url;
}

function getStoredToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return undefined;
    return JSON.parse(raw)?.token;
  } catch {
    return undefined;
  }
}

/** Parse body; hindari SyntaxError saat server mengembalikan HTML (404/502). */
export async function parseJsonSafe<T = unknown>(
  res: Response
): Promise<T | null> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const preview = (await res.text()).slice(0, 200);
    console.error(
      `API non-JSON (${res.status}):`,
      preview.startsWith("<!") ? "halaman HTML — cek backend & restart npm run dev" : preview
    );
    return null;
  }
  try {
    return (await res.json()) as T;
  } catch {
    console.error(`API invalid JSON (${res.status})`);
    return null;
  }
}

/**
 * Fetch API lewat proxy Next.js (/api/* → backend).
 * Jangan pakai NEXT_PUBLIC_API_URL di sini agar tidak kena HTML error dari URL salah.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
  auth: boolean | "admin" = false
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getStoredToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(path, { ...options, headers });
}

export async function apiFetchJsonArray<T = unknown>(
  path: string,
  options: RequestInit = {},
  auth: boolean | "admin" = false
): Promise<T[]> {
  const res = await apiFetch(path, options, auth);
  const data = await parseJsonSafe<T[] | { error?: string }>(res);

  if (!res.ok || data === null) {
    const msg =
      data && typeof data === "object" && "error" in data
        ? (data as { error: string }).error
        : `HTTP ${res.status}`;
    console.error(`API ${path}: ${msg}`);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function apiFetchJson<T = unknown>(
  path: string,
  options: RequestInit = {},
  auth: boolean | "admin" = false
): Promise<{ ok: boolean; data: T | null; status: number }> {
  const res = await apiFetch(path, options, auth);
  const data = await parseJsonSafe<T>(res);
  return { ok: res.ok && data !== null, data, status: res.status };
}
