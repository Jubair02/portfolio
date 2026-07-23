"use server";

import { crudCreate, crudUpdate, crudDelete, type CrudConfig } from "@/lib/crud";
import { experienceSchema, type ExperienceFormValues } from "@/lib/schemas/experience";

const cfg: CrudConfig<ExperienceFormValues> = {
  model: "experience",
  entity: "experience",
  schema: experienceSchema,
  paths: ["/admin/experience"],
  labelField: "position",
  toData: (v) => ({
    company: v.company,
    position: v.position,
    duration: v.duration,
    location: v.location || null,
    description: v.description || null,
    highlights: v.highlights,
    tags: v.tags,
    logo: v.logo || null,
    icon: v.icon,
  }),
};

export async function createExperience(values: Record<string, unknown>) {
  return crudCreate(cfg, values);
}
export async function updateExperience(id: string, values: Record<string, unknown>) {
  return crudUpdate(cfg, id, values);
}
export async function deleteExperience(id: string) {
  return crudDelete(cfg, id);
}
