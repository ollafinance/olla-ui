import { LayoutShell } from "@/components/layout/LayoutShell";
import { ClaimOverview } from "./components/ClaimOverview";
import { ClaimInfoPanel } from "./components/ClaimInfoPanel";

export function ClaimFeature() {
  return (
    <div className="max-w-2xl mx-auto w-full py-8 space-y-8">
      <ClaimInfoPanel />

      <ClaimOverview />
    </div>
  );
}
