"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AcoesProduto({ id, ativo }: { id: string; ativo: boolean }) {
  const router = useRouter();

  async function despublicar() {
    if (!confirm("Remover este produto do site? Ele continua salvo e pode voltar depois.")) return;
    const r = await fetch(`/api/admin/produtos/${id}`, { method: "DELETE" });
    if (!r.ok) {
      toast.error("Não foi possível remover.");
      return;
    }
    toast.success("Produto removido do site.");
    router.refresh();
  }

  if (!ativo) return null;

  return (
    <Button variant="ghost" size="icon" onClick={despublicar} title="Remover do site">
      <EyeOff className="h-4 w-4" />
    </Button>
  );
}
