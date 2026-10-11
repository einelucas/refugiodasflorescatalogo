import type { ReactNode } from "react";

export function AdminTableShell({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border bg-background">{children}</div>;
}
