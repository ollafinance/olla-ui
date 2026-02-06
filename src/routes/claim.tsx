import { createRoute } from "@tanstack/react-router";
import { ClaimFeature } from "@/features/claim/ClaimFeature";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/claim",
  component: ClaimFeature,
});
