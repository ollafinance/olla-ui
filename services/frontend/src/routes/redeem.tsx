import { createRoute } from "@tanstack/react-router";
import { RedeemFeature } from "@/features/redeem/RedeemFeature";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/redeem",
  component: RedeemFeature,
});
