/**
 * Live GitHub profile data for the "Building in public" section.
 *
 * Two public REST calls (user + owned repos), cached by Next's data cache for
 * an hour, so the numbers on the site are real instead of hand-typed. Without
 * a token GitHub allows 60 requests/hour per IP, which the hourly cache keeps
 * well within; set GITHUB_TOKEN (a fine-grained token with no scopes) to raise
 * that to 5,000 if the site is ever busy enough to matter.
 *
 * Any failure — offline, rate-limited, unknown user — falls back to the saved
 * snapshot in content/site.ts and flags `live: false` so the UI can say so
 * rather than present stale numbers as fresh.
 */
import { github as snapshot } from "@/content/site";
import type { IconName } from "@/lib/icon-names";

export type GitHubStat = { icon: IconName; label: string; value: number };
export type GitHubLanguage = { name: string; pct: number; color: string };

export type GitHubProfile = {
  username: string;
  url: string;
  memberSince: string;
  stats: GitHubStat[];
  languages: GitHubLanguage[];
  /** Public contribution-graph image for the username. */
  contributionChart: string;
  /** Convenience for the hero's floating "Repositories" card. */
  repoCount: number;
  /** False when the snapshot is being shown because the API was unavailable. */
  live: boolean;
};

const REVALIDATE_SECONDS = 60 * 60;
const API = "https://api.github.com";

/** GitHub's linguist colours for the languages this portfolio is likely to show. */
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#663399",
  SCSS: "#c6538c",
  "C#": "#178600",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
  Shell: "#89e051",
  Vue: "#41b883",
  "Jupyter Notebook": "#DA5B0B",
  Astro: "#ff5a03",
  Svelte: "#ff3e00",
  Other: "#8b5cf6",
};

type GitHubUser = {
  login: string;
  html_url: string;
  public_repos: number;
  followers: number;
  created_at: string;
};

type GitHubRepo = {
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  /** Repository size in KB — a fair proxy for how much code is in each language. */
  size: number;
};

function requestHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio-site",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function contributionChartUrl(username: string): string {
  // Brand purple, matching --primary.
  return `https://ghchart.rshah.org/6d5efc/${encodeURIComponent(username)}`;
}

/**
 * Share of code per language across the user's own (non-fork) repos, weighted
 * by repo size. Top four plus "Other", percentages summing to exactly 100.
 */
function languageMix(repos: GitHubRepo[]): GitHubLanguage[] {
  const weights = new Map<string, number>();
  for (const r of repos) {
    if (!r.language) continue;
    weights.set(r.language, (weights.get(r.language) ?? 0) + Math.max(r.size, 1));
  }
  const total = [...weights.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  const ranked = [...weights.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, 4);
  const rest = ranked.slice(4).reduce((n, [, w]) => n + w, 0);
  const entries: [string, number][] = rest > 0 ? [...top, ["Other", rest]] : top;

  // Floor everything, then hand the leftover points to the largest shares so
  // the bar always fills to 100%.
  const raw = entries.map(([name, w]) => ({ name, exact: (w / total) * 100 }));
  const floored = raw.map((e) => ({ name: e.name, pct: Math.floor(e.exact), frac: e.exact % 1 }));
  let leftover = 100 - floored.reduce((n, e) => n + e.pct, 0);
  for (const e of [...floored].sort((a, b) => b.frac - a.frac)) {
    if (leftover <= 0) break;
    e.pct += 1;
    leftover -= 1;
  }

  return floored
    .filter((e) => e.pct > 0)
    .map((e) => ({ name: e.name, pct: e.pct, color: LANGUAGE_COLORS[e.name] ?? LANGUAGE_COLORS.Other }));
}

/** The hand-maintained numbers from content/site.ts, used when the API is unavailable. */
function snapshotFor(username: string): GitHubProfile {
  const sameUser = username.toLowerCase() === snapshot.username.toLowerCase();
  return {
    username,
    url: `https://github.com/${encodeURIComponent(username)}`,
    memberSince: sameUser ? snapshot.memberSince : "",
    stats: sameUser
      ? snapshot.stats.map((s) => ({ icon: s.icon as IconName, label: s.label, value: s.value }))
      : [],
    languages: sameUser ? snapshot.languages.map((l) => ({ ...l })) : [],
    contributionChart: contributionChartUrl(username),
    repoCount: sameUser ? snapshot.stats[0].value : 0,
    live: false,
  };
}

export async function getGitHubProfile(username: string): Promise<GitHubProfile> {
  const user = username.trim();
  if (!user) return snapshotFor(snapshot.username);

  try {
    const init = { headers: requestHeaders(), next: { revalidate: REVALIDATE_SECONDS } };
    const [userRes, reposRes] = await Promise.all([
      fetch(`${API}/users/${encodeURIComponent(user)}`, init),
      fetch(`${API}/users/${encodeURIComponent(user)}/repos?per_page=100&type=owner&sort=pushed`, init),
    ]);
    if (!userRes.ok || !reposRes.ok) {
      throw new Error(`GitHub API responded ${userRes.status} / ${reposRes.status}`);
    }

    const profile = (await userRes.json()) as GitHubUser;
    const repos = (await reposRes.json()) as GitHubRepo[];
    const own = repos.filter((r) => !r.fork);
    const stars = own.reduce((n, r) => n + r.stargazers_count, 0);
    const since = new Date(profile.created_at).getFullYear();

    return {
      username: profile.login,
      url: profile.html_url,
      memberSince: String(since),
      stats: [
        { icon: "GitBranch", label: "Public repositories", value: profile.public_repos },
        { icon: "Star", label: "Stars earned", value: stars },
        { icon: "Users", label: "Followers", value: profile.followers },
        { icon: "Calendar", label: "Building since", value: since },
      ],
      languages: languageMix(own),
      contributionChart: contributionChartUrl(profile.login),
      repoCount: profile.public_repos,
      live: true,
    };
  } catch (err) {
    console.warn(
      "[github] Live fetch failed, showing snapshot:",
      err instanceof Error ? err.message : err
    );
    return snapshotFor(user);
  }
}
