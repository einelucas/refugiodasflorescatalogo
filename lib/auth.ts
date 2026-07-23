/* =========================================================
   Autenticação do painel (NextAuth, credentials).
   Um único papel: "admin". Sessão em JWT, sem tabela de sessão.
   ========================================================= */

import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        const usuario = await db.usuario.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        // Compara mesmo com usuário inexistente para não vazar,
        // pelo tempo de resposta, quais e-mails estão cadastrados.
        const hash =
          usuario?.senhaHash ??
          "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
        const confere = await bcrypt.compare(credentials.senha, hash);

        if (!usuario || !confere) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nome,
          papel: usuario.papel,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.papel = (user as { papel?: string }).papel ?? "admin";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { papel?: string }).papel =
          (token.papel as string) ?? "admin";
      }
      return session;
    },
  },
};

/// Guard usado no início de toda rota /api/admin/*.
export async function exigirAdmin() {
  const sessao = await getServerSession(authOptions);
  const papel = (sessao?.user as { papel?: string } | undefined)?.papel;
  if (!sessao || papel !== "admin") return null;
  return sessao;
}
