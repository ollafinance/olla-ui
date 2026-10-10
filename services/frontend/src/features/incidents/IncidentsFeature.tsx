import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { INCIDENTS } from "./incidents";

export function IncidentsFeature() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Incidents | Olla";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="px-6 py-8 md:px-10">
          <h1 className="text-3xl font-semibold md:text-4xl">Incident reports</h1>
          <p className="text-card-foreground/80 mt-4 max-w-2xl leading-relaxed">
            What went wrong, how we responded, and how we improved.
          </p>
          <nav
            aria-label="Incident reports"
            className="border-card-foreground/15 mt-6 space-y-3 border-t pt-6"
          >
            {INCIDENTS.map((incident) => (
              <a
                key={incident.id}
                href={`#${incident.id}`}
                className="flex flex-wrap items-center justify-between gap-2 text-sm hover:underline"
              >
                <span className="font-medium">{incident.title} ↓</span>
                <span className="text-card-foreground/60">{incident.date}</span>
              </a>
            ))}
          </nav>
        </CardContent>
      </Card>
      {INCIDENTS.map((incident) => (
        <article key={incident.id} id={incident.id} className="scroll-mt-6">
          <Card>
            <CardContent className="px-6 py-8 md:px-10">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-medium">
                <span className="text-card-foreground/60">Major · Post-mortem</span>
                <span className="text-card-foreground/60">{incident.date}</span>
              </div>
              <h2 className="text-2xl font-semibold">{incident.title}</h2>
              <p className="text-card-foreground/80 mt-4 leading-relaxed">{incident.summary}</p>
              <dl className="border-card-foreground/15 my-6 grid grid-cols-1 gap-5 border-y py-5 sm:grid-cols-3">
                {[
                  ["Affected", incident.affected],
                  ["Slashed", incident.slashed],
                  ["Incident window", incident.duration],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-card-foreground/60 text-xs">{label}</dt>
                    <dd className="mt-1 text-lg font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="space-y-6">
                {incident.sections.map((section) => (
                  <section key={section.heading}>
                    <h3 className="mb-2 font-semibold">{section.heading}</h3>
                    <p className="text-card-foreground/80 text-sm leading-relaxed">
                      {section.body}
                    </p>
                    {section.heading === "Impact" && (
                      <ul className="mt-3 space-y-2">
                        {incident.addresses.map((address) => (
                          <li key={address}>
                            <a
                              href={`https://dashtec.xyz/sequencers/${address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-card-foreground/80 font-mono text-xs break-all underline underline-offset-4"
                            >
                              {address} ↗
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
                <section>
                  <h3 className="mb-2 font-semibold">Timeline</h3>
                  <p className="text-card-foreground/60 mb-4 text-xs">
                    {incident.startedAt} → {incident.resolvedAt}
                  </p>
                  <ol className="border-card-foreground/20 space-y-5 border-l pl-5">
                    {incident.timeline.map((event) => (
                      <li key={event.time}>
                        <p className="text-card-foreground/60 text-xs">{event.time}</p>
                        <p className="mt-1 text-sm font-semibold">{event.label}</p>
                        <p className="text-card-foreground/80 mt-1 text-sm leading-relaxed">
                          {event.text}
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            </CardContent>
          </Card>
        </article>
      ))}
    </div>
  );
}
