import { createRoute } from "@tanstack/react-router";
import { TermsFeature } from "@/features/terms/TermsFeature";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsFeature,
});
