import { Link } from "@tanstack/react-router";

export function NavBar() {
  return (
    <nav className="bg-card flex items-center gap-2 rounded-full border border-0 p-2">
      <Link
        to="/stake"
        className="bg-card text-foreground [&.active]:bg-muted-soft [&.active]:text-foreground rounded-[56px] px-4 py-3 text-lg leading-[1.16] font-medium tracking-[-0.36px] transition-all"
      >
        Stake
      </Link>
      <Link
        to="/redeem"
        className="bg-card text-foreground [&.active]:bg-muted-soft [&.active]:text-foreground rounded-[56px] px-4 py-3 text-lg leading-[1.16] font-medium tracking-[-0.36px] transition-all"
      >
        Redeem
      </Link>
    </nav>
  );
}
