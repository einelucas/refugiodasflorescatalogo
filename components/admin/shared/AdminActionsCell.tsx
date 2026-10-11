import type { ReactNode } from "react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function AdminActionsCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <TableCell className={cn("flex gap-1", className)}>{children}</TableCell>;
}
