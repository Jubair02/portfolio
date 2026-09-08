import { ArrowUpRight } from "lucide-react";
import type { GitHubProfile } from "@/lib/github";
import type { MiniProject, SectionCopy } from "@/lib/schemas/site-copy";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { DataIcon, GithubIcon } from "@/components/icons";

export function GitHubStats({
  heading,
  github,
  miniProjects,
}: {
  heading: SectionCopy;
  github: GitHubProfile;
  miniProjects: MiniProject[];
}) {
  return (
    <Section id="github" className="border-t border-[color:var(--border)]">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          description={heading.description}
        />
        <Reveal delay={0.1}>
          <a
            href={github.url}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-5 py-2.5 text-sm font-medium transition-colors hover:border-[color:var(--primary)]/50"
          >
            <GithubIcon className="size-4" />@{github.username}
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Reveal>
      </div>

      {/* Stat cards */}
      {github.stats.length > 0 && (
        <RevealGroup className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {github.stats.map((s) => (
            <RevealItem key={s.label}>
              <div className="card-hover surface h-full rounded-3xl p-6 hover:border-[color:var(--primary)]/40 hover:shadow-glow">
                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent-2/10 text-primary">
                  <DataIcon name={s.icon} className="size-5" />
                </span>
                <p className="mt-4 text-3xl font-bold tracking-tight">
                  {/* Years (e.g. 2022) read better as-is than counted up from zero. */}
                  {s.value >= 1000 ? s.value : <Counter value={s.value} />}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      )}

      {/* minmax(0,…) tracks + min-w-0 items keep the wide contribution chart
          from forcing the columns past the viewport on small screens. */}
      <div className="mt-6 grid gap-6 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Languages */}
        <Reveal className="min-w-0">
          <div className="surface h-full rounded-3xl p-7">
            <h3 className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Most used languages
            </h3>
            {github.languages.length > 0 ? (
              <>
                <div className="mt-5 flex h-3 overflow-hidden rounded-full">
                  {github.languages.map((l) => (
                    <span
                      key={l.name}
                      style={{ width: `${l.pct}%`, backgroundColor: l.color }}
                      title={`${l.name} ${l.pct}%`}
                    />
                  ))}
                </div>
                <ul className="mt-5 grid grid-cols-2 gap-3">
                  {github.languages.map((l) => (
                    <li key={l.name} className="flex items-center gap-2 text-sm">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: l.color }}
                      />
                      <span className="text-foreground/80">{l.name}</span>
                      <span className="ml-auto font-mono text-xs text-muted-foreground">
                        {l.pct}%
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">
                Language data isn&apos;t available right now.
              </p>
            )}
          </div>
        </Reveal>

        {/* Contribution graph */}
        <Reveal direction="left" className="min-w-0">
          <div className="surface h-full min-w-0 rounded-3xl p-7">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Contribution activity
              </h3>
              {github.memberSince && (
                <span className="text-xs text-muted-foreground">
                  Since {github.memberSince}
                </span>
              )}
            </div>
            <div className="mt-5 overflow-x-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={github.contributionChart}
                alt={`GitHub contribution graph for @${github.username}`}
                loading="lazy"
                className="min-w-[34rem] w-full opacity-90"
              />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {github.live
                ? "Live data from GitHub, refreshed hourly."
                : "Showing a saved snapshot — GitHub couldn't be reached just now."}
            </p>
          </div>
        </Reveal>
      </div>

      {/* Mini projects */}
      {miniProjects.length > 0 && (
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">More experiments:</span>
            {miniProjects.map((m) => (
              <a
                key={`${m.title}-${m.href}`}
                href={m.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-3.5 py-1.5 text-sm transition-colors hover:border-[color:var(--primary)]/50"
              >
                <span className="font-medium text-foreground/85">{m.title}</span>
                {m.tech && <span className="text-xs text-muted-foreground">{m.tech}</span>}
                <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ))}
          </div>
        </Reveal>
      )}
    </Section>
  );
}
