import { createRoute } from "@tanstack/react-router";
import { StakingFeature } from "@/features/staking/StakingFeature";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: StakingFeature,
});
