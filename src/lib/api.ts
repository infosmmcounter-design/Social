export async function api<T = unknown>(
  url: string,
  opts?: RequestInit & { json?: unknown }
): Promise<T> {
  const headers: Record<string, string> = {
    ...(opts?.headers as Record<string, string>),
  };
  let body = opts?.body;
  if (opts?.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  }
  let res: Response;
  try {
    res = await fetch(url, { ...opts, headers, body, credentials: "include" });
  } catch {
    throw new Error("Network error — check your connection and try again.");
  }
  const raw = await res.text();
  let data: { error?: string } = {};
  try {
    data = raw ? (JSON.parse(raw) as { error?: string }) : {};
  } catch {
    if (
      res.status === 401 ||
      /edge-access|Login Redirect|netlify\.app\/edge-access/i.test(raw)
    ) {
      throw new Error(
        "Host password protection is blocking the API. Turn off visitor access, then retry."
      );
    }
    throw new Error(`Server returned non-JSON (HTTP ${res.status}).`);
  }
  if (!res.ok) {
    throw new Error(data.error || res.statusText || `Request failed (${res.status})`);
  }
  return data as T;
}
