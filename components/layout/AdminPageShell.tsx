"use client";

import type { ReactNode } from "react";
import { AdminNavigation } from "./AdminNavigation";
import { AdminTopbar } from "./AdminTopbar";
import type { AdminController } from "../../features/admin/hooks/useAdminController";
import type { AdminSection } from "../../features/shared/types";

export function AdminPageShell({ active, controller, children }: { active: AdminSection; controller: AdminController; children: ReactNode }) {
  return (
    <main className={controller.dark ? "app dark" : "app"}>
      <section className="admin-shell">
        <AdminTopbar />
        <section className="panel-layout">
          <AdminNavigation
            active={active}
            onRefresh={() => void controller.loadData()}
            onTheme={() => controller.setDark((value) => !value)}
            onLogout={() => void controller.logout()}
          />
          <section className="workspace">{children}</section>
        </section>
      </section>
    </main>
  );
}
