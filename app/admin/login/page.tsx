"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Flower2 } from "lucide-react";
import { Providers } from "@/components/Providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

function Formulario() {
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
      // Mensagem genérica: não revela se o e-mail existe.
      setErro("E-mail ou senha incorretos.");
      setEnviando(false);
      return;
    }
    window.location.href = "/admin/produtos";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Flower2 className="h-8 w-8 text-primary" />
          <CardTitle className="font-serif text-xl">Refúgio das Flores</CardTitle>
          <p className="text-sm text-muted-foreground">Painel de administração</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={entrar} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

export default function LoginPage() {
  return (
    <Providers>
      <Formulario />
    </Providers>
  );
}
