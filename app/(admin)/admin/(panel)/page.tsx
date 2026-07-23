import {
  FolderKanban,
  Wrench,
  BadgeCheck,
  Briefcase,
  Mail,
  MessageSquareQuote,
  Server,
  Images,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { getDashboardStats, getRecentActivity } from "@/lib/dashboard";
import { StatCard } from "@/components/admin/StatCard";
import { DashboardChart } from "@/components/admin/DashboardChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function DashboardPage() {
  const [stats, activity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
  ]);

  const chartData = [
    { label: "Projects", count: stats.projects },
    { label: "Skills", count: stats.skills },
    { label: "Certificates", count: stats.certificates },
    { label: "Experience", count: stats.experience },
    { label: "Services", count: stats.services },
    { label: "Testimonials", count: stats.testimonials },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your portfolio content.
        </p>
      </div>

      {!stats.dbConnected && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 py-4 text-sm">
            <AlertTriangle className="size-5 shrink-0 text-amber-500" />
            <span>
              Database not reachable yet. Add your <code>DATABASE_URL</code>, then run{" "}
              <code>npm run db:migrate</code> and <code>npm run db:seed</code>.
              Counts will populate once connected.
            </span>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Projects" value={stats.projects} icon={FolderKanban} href="/admin/projects" />
        <StatCard label="Total Skills" value={stats.skills} icon={Wrench} accent="accent" />
        <StatCard label="Certificates" value={stats.certificates} icon={BadgeCheck} accent="gold" />
        <StatCard label="Experience" value={stats.experience} icon={Briefcase} accent="primary" />
        <StatCard label="Services" value={stats.services} icon={Server} accent="accent" />
        <StatCard label="Testimonials" value={stats.testimonials} icon={MessageSquareQuote} accent="gold" />
        <StatCard
          label="Messages"
          value={stats.messages}
          icon={Mail}
          accent="primary"
          hint={stats.unreadMessages ? `${stats.unreadMessages} unread` : undefined}
        />
        <StatCard label="Media Files" value={stats.media} icon={Images} accent="accent" />
      </div>

      {/* Chart + activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Content overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4" /> Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No activity yet. Changes you make will show up here.
              </p>
            ) : (
              <ul className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="truncate">
                        <span className="font-medium capitalize">{a.action}</span>{" "}
                        <span className="text-muted-foreground">{a.entity}</span>
                        {a.detail ? ` — ${a.detail}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
