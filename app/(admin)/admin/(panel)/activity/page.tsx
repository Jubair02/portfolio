import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getActivityPage } from "@/lib/dashboard";
import { PageHeader } from "@/components/admin/Field";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

// Server-rendered, so a fixed zone keeps the output identical on every render.
const when = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const { entries, total } = await getActivityPage(page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description={`${total} recorded change${total === 1 ? "" : "s"}. Times are UTC.`}
      />

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No activity yet. Changes you make in the admin will show up here.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">When</TableHead>
                <TableHead className="w-28">Action</TableHead>
                <TableHead className="w-40">Entity</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {when.format(a.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium capitalize">{a.action}</TableCell>
                  <TableCell className="text-muted-foreground">{a.entity}</TableCell>
                  <TableCell className="text-muted-foreground">{a.detail ?? ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" asChild disabled={page <= 1}>
            <Link href={`/admin/activity?page=${page - 1}`} aria-disabled={page <= 1}>
              <ChevronLeft className="size-4" /> Prev
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
            <Link href={`/admin/activity?page=${page + 1}`} aria-disabled={page >= totalPages}>
              Next <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
