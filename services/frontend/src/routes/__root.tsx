import { useEffect } from "react";
import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutShell } from "@/components/layout/layout-shell";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export const Route = createRootRoute({
  component: () => (
    <LayoutShell>
      <ScrollToTop />
      <Outlet />
    </LayoutShell>
  ),
});
