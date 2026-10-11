import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";

export function ProductStatusBadge({ active }: { active: boolean }) {
  return (
    <AdminStatusBadge
      active={active}
      activeLabel="publicado"
      inactiveLabel="rascunho"
    />
  );
}
