import { Providers } from "@/components/Providers";
import { AdminShell } from "@/components/admin/AdminShell";

import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AdminShell>{children}</AdminShell>
    </Providers>
  );
}
