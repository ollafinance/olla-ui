import { createRootRoute, Outlet } from "@tanstack/react-router";
import { LayoutShell } from "@/components/layout/LayoutShell";

export const Route = createRootRoute({
  component: () => (
    <LayoutShell>
      <Outlet />
    </LayoutShell>
  ),
});
