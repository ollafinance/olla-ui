import { type ReactNode, useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/Card";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

function BackLink() {
  const router = useRouter();
  const canGoBack = router.history.length > 1;

  const className =
    "text-card-foreground/70 hover:text-card-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors";

  if (canGoBack) {
    return (
      <button type="button" onClick={() => router.history.back()} className={className}>
        <span aria-hidden>←</span> Back
      </button>
    );
  }

  return (
    <Link to="/stake" className={className}>
      <span aria-hidden>←</span> Back to app
    </Link>
  );
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY > 400;
      const distanceFromBottom =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      const nearBottom = distanceFromBottom < 160;
      setVisible(scrolled && !nearBottom);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`bg-surface text-surface-foreground border-surface-border/50 focus:ring-ring fixed right-6 bottom-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span aria-hidden className="text-lg leading-none">
        ↑
      </span>
    </button>
  );
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <>
      <Card className="w-full">
        <CardContent className="px-6 py-8 md:px-10 md:py-10">
          <header className="border-card-foreground/15 mb-8 border-b pb-6">
            <div className="mb-4">
              <BackLink />
            </div>
            <h1 className="text-card-foreground text-2xl font-semibold md:text-3xl">{title}</h1>
            <p className="text-card-foreground/70 mt-2 text-sm">Last updated: {lastUpdated}</p>
          </header>
          <div className="divide-card-foreground/15 divide-y">{children}</div>
        </CardContent>
      </Card>
      <BackToTopButton />
    </>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="py-8 first:pt-0 last:pb-0">
      <h2 className="text-card-foreground mb-4 text-xl font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

interface SubSectionProps {
  title: string;
  children: ReactNode;
}

export function SubSection({ title, children }: SubSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-card-foreground text-base font-semibold">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <p className="text-card-foreground/80 text-sm leading-relaxed">{children}</p>;
}

export function List({ children }: { children: ReactNode }) {
  return (
    <ul className="text-card-foreground/80 list-disc space-y-2 pl-6 text-sm leading-relaxed">
      {children}
    </ul>
  );
}
