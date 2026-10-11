import assert from "node:assert/strict";
import { test } from "node:test";
import { deleteAdminResource, saveAdminResource } from "@/lib/admin/requisicoes";

type Call = { url: string; init: RequestInit };

function fakeFetch(response: Response) {
  const calls: Call[] = [];
  const fetcher = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return response;
  }) as unknown as typeof fetch;
  return { fetcher, calls };
}

test("salvamento administrativo preserva URL, método, JSON e erro específico", async () => {
  const { fetcher, calls } = fakeFetch(
    Response.json({ erro: "Slug já existe." }, { status: 400 }),
  );
  assert.deepEqual(
    await saveAdminResource("/api/admin/categorias/id", "PATCH", { nome: "Teste" }, fetcher),
    { ok: false, error: "Slug já existe." },
  );
  assert.equal(calls[0].url, "/api/admin/categorias/id");
  assert.equal(calls[0].init.method, "PATCH");
  assert.equal(calls[0].init.headers?.["Content-Type" as keyof HeadersInit], "application/json");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), { nome: "Teste" });
});

test("exclusão preserva DELETE e leitura opcional do erro", async () => {
  const { fetcher, calls } = fakeFetch(
    Response.json({ erro: "Categoria com produtos." }, { status: 409 }),
  );
  assert.deepEqual(
    await deleteAdminResource("/api/admin/categorias/id", fetcher, true),
    { ok: false, error: "Categoria com produtos." },
  );
  assert.equal(calls[0].init.method, "DELETE");
});
