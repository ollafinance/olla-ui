import { Link } from "@tanstack/react-router";

export function NavBar() {
  return (
    <nav className="flex items-center gap-2 bg-surface p-2 rounded-full border border-surface-border">
      <Link
        to="/stake"
        className="px-4 py-3 text-lg font-medium rounded-[56px] tracking-[-0.36px] transition-all leading-[1.16] bg-surface text-surface-foreground [&.active]:bg-card [&.active]:text-black"
      >
        Stake
      </Link>
      <Link
        to="/redeem"
        className="px-4 py-3 text-lg font-medium rounded-[56px] tracking-[-0.36px] transition-all leading-[1.16] bg-surface text-surface-foreground [&.active]:bg-card [&.active]:text-black"
      >
        Redeem
      </Link>
    </nav>
  );
}
