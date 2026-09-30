import type { ReactNode } from "react";
import { DemoDashboardShell } from "@/demo/pages/admin";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DemoDashboardShell>{children}</DemoDashboardShell>;
}
