import { Download, FileText } from "lucide-react";
import type { ProjectAttachment } from "@/content/site";

/** File extension shown on the row, derived from the stored URL. */
function extensionOf(url: string): string {
  const clean = url.split("?")[0];
  const ext = clean.slice(clean.lastIndexOf(".") + 1);
  return ext.length <= 4 ? ext.toUpperCase() : "FILE";
}

/** Documents a visitor can download: reports, specs, the deck itself. */
export function Attachments({ attachments }: { attachments: ProjectAttachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="text-2xl font-semibold tracking-tight">Documents</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]">
        {attachments.map((file) => (
          <li key={file.url}>
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer noopener"
              className="card-hover surface group flex items-center gap-3 rounded-2xl p-4 hover:border-[color:var(--primary)]/40"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{file.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {extensionOf(file.url)}
                </span>
              </span>
              <Download className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
