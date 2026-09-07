import { Mail, Phone, Globe } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export type SocialLink = { platform: string; url: string };

/** Icon for a platform name as typed in Admin → Social Links. */
export function PlatformIcon({
  platform,
  className = "size-[1.1rem]",
}: {
  platform: string;
  className?: string;
}) {
  const p = platform.toLowerCase();
  if (p.includes("github")) return <GithubIcon className={className} />;
  if (p.includes("linkedin")) return <LinkedinIcon className={className} />;
  if (p.includes("email") || p.includes("mail")) return <Mail className={className} />;
  if (p.includes("phone") || p.includes("tel")) return <Phone className={className} />;
  return <Globe className={className} />;
}

/**
 * A row of social links driven entirely by the Social Links collection.
 * Every surface that used to hard-code GitHub + LinkedIn renders this instead,
 * so adding, hiding or reordering a link in the admin updates all of them.
 */
export function SocialIcons({
  links,
  limit,
  className,
  linkClassName,
  iconClassName = "size-[1.1rem]",
}: {
  links: SocialLink[];
  limit?: number;
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
}) {
  const shown = typeof limit === "number" ? links.slice(0, limit) : links;
  if (shown.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {shown.map((s) => (
        <a
          key={`${s.platform}-${s.url}`}
          href={s.url}
          target={s.url.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer noopener"
          aria-label={s.platform}
          className={cn(
            "grid size-10 place-items-center rounded-full border border-[color:var(--border)] text-foreground/70 transition-colors hover:border-[color:var(--primary)]/50 hover:text-foreground",
            linkClassName
          )}
        >
          <PlatformIcon platform={s.platform} className={iconClassName} />
        </a>
      ))}
    </div>
  );
}
