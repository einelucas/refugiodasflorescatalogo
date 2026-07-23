/* =========================================================
   Cliente Prisma com driver adapter do Neon.

   Por que o adapter é obrigatório aqui:
   o Prisma padrão abre conexões TCP persistentes. Cada função
   serverless da Vercel que "acorda" abre o próprio pool, e sob
   carga isso estoura o limite de conexões do Neon. O adapter
   troca TCP por WebSocket/HTTP, que o Neon multiplexa.

   Sem isso o projeto funciona em dev e quebra em produção.
   ========================================================= */

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// Necessário apenas em Node.js; no Edge o WebSocket é nativo.
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function criarCliente() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não definida.");
  }
  // O adapter recebe a configuração do pool, não uma instância —
  // ele gerencia o ciclo de vida das conexões internamente.
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? criarCliente();

// Em dev, o hot reload recria módulos; sem o cache global você
// acumula um PrismaClient novo a cada save.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
