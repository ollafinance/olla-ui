import { Link } from "@tanstack/react-router";
import { useClaims } from "@/features/redeem/hooks/useClaims";

export function NavBar() {
  const { claims } = useClaims();

  const hasReady = claims.some((c) => c.status === "ready");
  const hasProcessing = claims.some((c) => c.status === "processing");

  return (
    <nav className="bg-nav-bg border-nav-border flex items-center gap-2 rounded-full border p-2">
      <Link
        to="/stake"
        className="text-nav-text-inactive [&.active]:bg-nav-bg-active rounded-[56px] px-4 py-3 text-lg leading-[1.16] font-medium tracking-[-0.36px] transition-all [&.active]:text-black"
      >
        Stake
      </Link>
      <Link
        to="/redeem"
        className="text-nav-text-inactive [&.active]:bg-nav-bg-active flex items-center gap-2 rounded-[56px] px-4 py-3 text-lg leading-[1.16] font-medium tracking-[-0.36px] transition-all [&.active]:text-black"
      >
        Redeem
        {hasReady ? (
          <span className="text-xs text-[#8bdae5]">●</span>
        ) : hasProcessing ? (
          <span className="text-xs text-[#FF9E5E]">●</span>
        ) : null}
      </Link>
    </nav>
  );
}
