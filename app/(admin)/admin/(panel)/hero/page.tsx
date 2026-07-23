import { getHero } from "@/lib/data";
import { HeroForm } from "@/components/admin/hero/HeroForm";
import { PageHeader } from "@/components/admin/Field";
import type { HeroFormValues } from "@/lib/schemas/hero";

export const dynamic = "force-dynamic";

export default async function HeroAdminPage() {
  const h = await getHero();
  const initial: HeroFormValues = {
    name: h.name,
    firstName: h.firstName,
    initials: h.initials,
    role: h.role,
    roles: h.roles,
    subheadline: h.subheadline,
    location: h.location,
    availabilityOpen: h.availabilityOpen,
    availabilityLabel: h.availabilityLabel,
    email: h.email,
    resumeUrl: h.resumeUrl,
    heroImage: h.heroImage,
    primaryCtaLabel: h.primaryCtaLabel,
    primaryCtaHref: h.primaryCtaHref,
    secondaryCtaLabel: h.secondaryCtaLabel,
    secondaryCtaHref: h.secondaryCtaHref,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Hero" description="The first thing visitors see." />
      <HeroForm initial={initial} />
    </div>
  );
}
