import Link from "next/link";
import { Pencil } from "lucide-react";
import { AcoesProduto } from "@/components/admin/AcoesProduto";
import { Button } from "@/components/ui/button";

export function ProductActions({
  id,
  active,
  showEdit = false,
}: {
  id: string;
  active: boolean;
  showEdit?: boolean;
}) {
  return (
    <>
      {showEdit && (
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/admin/produtos/${id}`}>
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
        </Button>
      )}
      <AcoesProduto id={id} ativo={active} />
    </>
  );
}
