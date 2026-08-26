import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="admin-shell">
      <AdminSidebar name={session.name} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
