import { Badge } from "@/components/ui/badge";

export function AdminStatusBadge({ active, activeLabel, inactiveLabel }: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <Badge variant={active ? "success" : "secondary"}>
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}
