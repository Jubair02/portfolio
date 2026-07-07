import { ArrowUpRight } from "lucide-react";
import { posts } from "@/content/site";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Blog() {
  return (
    <Section id="blog" className="border-t border-[color:var(--border)]">
      <SectionHeading
        eyebrow="Writing"
        title="Insights & notes"
        description="Occasional write-ups on things I learn while building. Ideas, patterns, and lessons from the trenches."
      />

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.title} delay={0.07 * i}>
            <a
              href={post.href}
              className="card-hover surface group flex h-full flex-col rounded-3xl p-6 hover:-translate-y-1 hover:border-[color:var(--primary)]/40 hover:shadow-glow"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
                  {post.tag}
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
                {post.title}
              </h3>
              <p className="mt-2 grow text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readingTime}</span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
