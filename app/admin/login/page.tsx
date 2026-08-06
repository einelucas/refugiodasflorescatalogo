"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Flower2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    const r = await signIn("credentials", { email, senha, redirect: false });

    if (r?.error) {
      setErro("E-mail ou senha incorretos.");
      setEnviando(false);
      return;
    }

    window.location.href = "/admin/produtos";
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-[#fff6fb] via-[#f2e5f5] to-[#fffaf7] px-4 py-8 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#a875ae]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[#d97ca8]/20 blur-3xl"
      />

      <Card className="relative w-full max-w-sm border-primary/10 shadow-lg">
        <CardHeader className="items-center px-5 text-center sm:px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#54205f] to-[#76367f] shadow-md shadow-primary/20">
            <Flower2 className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="font-serif text-2xl font-medium text-primary sm:text-3xl">
            Refúgio das Flores
          </CardTitle>
          <p className="text-sm text-muted-foreground">Painel de administração</p>
        </CardHeader>

        <CardContent className="px-5 pb-6 sm:px-6">
          <form onSubmit={entrar} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            {erro && (
              <Alert variant="destructive">
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
