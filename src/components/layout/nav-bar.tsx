import { Link } from "@tanstack/react-router";

export function NavBar() {
  return (
    <nav className="bg-surface border-surface-border flex items-center gap-2 rounded-full border p-2">
      <Link
        to="/stake"
        className="bg-surface text-surface-foreground [&.active]:bg-card rounded-[56px] px-4 py-3 text-lg leading-[1.16] font-medium tracking-[-0.36px] transition-all [&.active]:text-black"
      >
        Stake
      </Link>
      <Link
        to="/redeem"
        className="bg-surface text-surface-foreground [&.active]:bg-card rounded-[56px] px-4 py-3 text-lg leading-[1.16] font-medium tracking-[-0.36px] transition-all [&.active]:text-black"
      >
        Redeem
      </Link>
    </nav>
  );
}
