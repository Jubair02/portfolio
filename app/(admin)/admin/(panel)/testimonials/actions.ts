"use server";

import { crudCreate, crudUpdate, crudDelete, type CrudConfig } from "@/lib/crud";
import { testimonialSchema, type TestimonialFormValues } from "@/lib/schemas/collections";

const cfg: CrudConfig<TestimonialFormValues> = {
  model: "testimonial",
  entity: "testimonial",
  schema: testimonialSchema,
  paths: ["/admin/testimonials"],
  labelField: "name",
  toData: (v) => ({
    name: v.name,
    designation: v.designation || null,
    company: v.company || null,
    image: v.image || null,
    review: v.review,
    rating: v.rating,
    initials: v.initials || null,
  }),
};

export async function createTestimonial(values: Record<string, unknown>) {
  return crudCreate(cfg, values);
}
export async function updateTestimonial(id: string, values: Record<string, unknown>) {
  return crudUpdate(cfg, id, values);
}
export async function deleteTestimonial(id: string) {
  return crudDelete(cfg, id);
}
