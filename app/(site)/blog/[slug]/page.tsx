import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { getPost, getHero } from "@/lib/data";
import { SimpleMarkdown } from "@/components/ui/SimpleMarkdown";
import { Eyebrow } from "@/components/ui/Section";

// Posts are edited rarely; the admin also revalidates /blog on every save.
export const revalidate = 60;

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found", robots: { index: false } };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const [post, hero] = await Promise.all([getPost(slug), getHero()]);
  if (!post) notFound();
  // Link-only posts have no page of their own; send the reader straight there.
  if (post.externalUrl && !post.content.trim()) redirect(post.externalUrl);

  return (
    <article className="container-page pb-24 pt-32 sm:pt-36">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/#blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> All posts
        </Link>

        <header className="mt-8">
          {post.tag && <Eyebrow>{post.tag}</Eyebrow>}
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80">{hero.name}</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" aria-hidden="true" />
              <time dateTime={post.publishedAt}>{dateFormat.format(new Date(post.publishedAt))}</time>
            </span>
            {post.readingTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden="true" />
                {post.readingTime}
              </span>
            )}
          </div>
        </header>

        {post.coverImage && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl border border-[color:var(--border)]">
            <Image src={post.coverImage} alt="" fill priority sizes="(max-width: 768px) 100vw, 48rem" className="object-cover" />
          </div>
        )}

        <SimpleMarkdown source={post.content} className="mt-10 text-[1.05rem]" />

        {post.externalUrl && (
          <p className="mt-10 text-sm text-muted-foreground">
            Originally published at{" "}
            <a
              href={post.externalUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary underline decoration-primary/40 underline-offset-4"
            >
              {new URL(post.externalUrl).hostname}
            </a>
            .
          </p>
        )}
      </div>
    </article>
  );
}
