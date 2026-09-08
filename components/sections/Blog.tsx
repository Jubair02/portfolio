import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { PostData } from "@/lib/data";
import type { SectionCopy } from "@/lib/schemas/site-copy";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function Blog({ posts, heading }: { posts: PostData[]; heading: SectionCopy }) {
  // Nothing published yet — render nothing rather than an empty heading.
  if (posts.length === 0) return null;

  return (
    <Section id="blog" className="border-t border-[color:var(--border)]">
      <SectionHeading
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description}
      />

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {posts.map((post, i) => {
          const external = Boolean(post.externalUrl);
          const href = post.externalUrl ?? `/blog/${post.slug}`;
          const card = (
            <>
              {post.coverImage && (
                <div className="relative -mx-6 -mt-6 mb-5 aspect-[16/9] overflow-hidden rounded-t-3xl border-b border-[color:var(--border)]">
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                {post.tag ? (
                  <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
                    {post.tag}
                  </span>
                ) : (
                  <span />
                )}
                <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
                {post.title}
              </h3>
              <p className="mt-2 grow text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <time dateTime={post.publishedAt}>{dateFormat.format(new Date(post.publishedAt))}</time>
                {post.readingTime && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{post.readingTime}</span>
                  </>
                )}
              </div>
            </>
          );
          const className =
            "card-hover surface group flex h-full flex-col rounded-3xl p-6 hover:-translate-y-1 hover:border-[color:var(--primary)]/40 hover:shadow-glow";

          return (
            <Reveal key={post.slug} delay={0.07 * i}>
              {external ? (
                <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
                  {card}
                </a>
              ) : (
                <Link href={href} className={className}>
                  {card}
                </Link>
              )}
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
