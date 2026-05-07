import { createRoute } from "@tanstack/react-router";
import { PrivacyFeature } from "@/features/privacy/PrivacyFeature";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyFeature,
});
