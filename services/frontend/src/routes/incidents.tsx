import { createRoute } from "@tanstack/react-router";
import { IncidentsFeature } from "@/features/incidents/IncidentsFeature";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/incidents",
  component: IncidentsFeature,
});
