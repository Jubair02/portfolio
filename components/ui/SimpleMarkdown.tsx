import type { ReactNode } from "react";

/**
 * A deliberately tiny, safe renderer for blog posts written in the admin.
 *
 * Block syntax (one construct per line):
 *   "## Heading" / "### Sub-heading", "- item" or "* item", "> quote",
 *   blank line = paragraph break.
 * Inline: **bold**, `code`, [text](https://…).
 *
 * Nothing here ever emits raw HTML from the input, so there is no XSS surface
 * and no dependency to keep patched.
 */

const INLINE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded-md bg-[color:var(--muted)] px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (link) {
      return (
        <a
          key={i}
          href={link[2]}
          target="_blank"
          rel="noreferrer noopener"
          className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          {link[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

type Block =
  | { type: "h2" | "h3" | "p" | "quote"; text: string }
  | { type: "ul"; items: string[] };

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "p", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "ul", items: list });
    list = [];
  };

  for (const raw of source.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph(); flushList();
      blocks.push({ type: "h3", text: line.slice(4) });
    } else if (line.startsWith("## ")) {
      flushParagraph(); flushList();
      blocks.push({ type: "h2", text: line.slice(3) });
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      list.push(line.slice(2));
    } else if (line.startsWith("> ")) {
      flushParagraph(); flushList();
      blocks.push({ type: "quote", text: line.slice(2) });
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

export function SimpleMarkdown({ source, className }: { source: string; className?: string }) {
  const blocks = parseBlocks(source);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} className="mt-10 text-2xl font-semibold tracking-tight first:mt-0">
                {renderInline(b.text)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-8 text-xl font-semibold tracking-tight">
                {renderInline(b.text)}
              </h3>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="mt-5 border-l-2 border-[color:var(--primary)]/60 pl-4 text-muted-foreground italic"
              >
                {renderInline(b.text)}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={i} className="mt-5 list-disc space-y-2 pl-6 text-muted-foreground">
                {b.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          default:
            return (
              <p key={i} className="mt-5 leading-relaxed text-muted-foreground first:mt-0">
                {renderInline(b.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
