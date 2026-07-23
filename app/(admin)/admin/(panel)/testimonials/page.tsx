import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/Field";
import { EntityManager, type FieldConfig } from "@/components/admin/EntityManager";
import { createTestimonial, updateTestimonial, deleteTestimonial } from "./actions";

export const dynamic = "force-dynamic";

const fields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "designation", label: "Designation", type: "text" },
  { name: "company", label: "Company", type: "text" },
  { name: "initials", label: "Initials", type: "text", hint: "Fallback avatar (e.g. JD)" },
  { name: "rating", label: "Rating (1–5)", type: "number" },
  { name: "review", label: "Review", type: "textarea" },
  { name: "image", label: "Photo", type: "image", folder: "portfolio/testimonials" },
];

async function getItems() {
  try {
    const rows = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
    return rows.map((t) => ({
      id: t.id,
      name: t.name,
      designation: t.designation ?? "",
      company: t.company ?? "",
      initials: t.initials ?? "",
      rating: t.rating,
      review: t.review,
      image: t.image ?? "",
    }));
  } catch {
    return [];
  }
}

export default async function TestimonialsAdminPage() {
  const items = await getItems();
  return (
    <div className="space-y-6">
      <PageHeader title="Testimonials" description="Kind words from people you've worked with." />
      <EntityManager
        items={items}
        fields={fields}
        labelKey="name"
        subtitleKey="company"
        imageKey="image"
        addLabel="Add testimonial"
        create={createTestimonial}
        update={updateTestimonial}
        remove={deleteTestimonial}
      />
    </div>
  );
}
