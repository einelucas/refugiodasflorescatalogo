export type AdminRequestResult =
  | { ok: true }
  | { ok: false; error?: string };

function getError(data: unknown): string | undefined {
  if (
    typeof data === "object" &&
    data !== null &&
    "erro" in data &&
    typeof data.erro === "string"
  ) {
    return data.erro;
  }
}

export async function saveAdminResource(
  url: string,
  method: "POST" | "PATCH",
  payload: unknown,
  fetcher: typeof fetch = fetch,
): Promise<AdminRequestResult> {
  const response = await fetcher(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: unknown = await response.json();
  return response.ok ? { ok: true } : { ok: false, error: getError(data) };
}

export async function deleteAdminResource(
  url: string,
  fetcher: typeof fetch = fetch,
  parseResponse = false,
): Promise<AdminRequestResult> {
  const response = await fetcher(url, { method: "DELETE" });
  const data: unknown = parseResponse ? await response.json() : undefined;
  return response.ok ? { ok: true } : { ok: false, error: getError(data) };
}
