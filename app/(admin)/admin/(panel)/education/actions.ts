"use server";

import { crudCreate, crudUpdate, crudDelete, type CrudConfig } from "@/lib/crud";
import { educationSchema, type EducationFormValues } from "@/lib/schemas/experience";

const cfg: CrudConfig<EducationFormValues> = {
  model: "education",
  entity: "education",
  schema: educationSchema,
  paths: ["/admin/education"],
  labelField: "degree",
  toData: (v) => ({
    institute: v.institute,
    degree: v.degree,
    duration: v.duration,
    result: v.result || null,
    logo: v.logo || null,
    icon: v.icon,
  }),
};

export async function createEducation(values: Record<string, unknown>) {
  return crudCreate(cfg, values);
}
export async function updateEducation(id: string, values: Record<string, unknown>) {
  return crudUpdate(cfg, id, values);
}
export async function deleteEducation(id: string) {
  return crudDelete(cfg, id);
}
