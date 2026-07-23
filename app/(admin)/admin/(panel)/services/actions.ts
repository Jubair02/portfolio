"use server";

import { crudCreate, crudUpdate, crudDelete, type CrudConfig } from "@/lib/crud";
import { serviceSchema, type ServiceFormValues } from "@/lib/schemas/collections";

const cfg: CrudConfig<ServiceFormValues> = {
  model: "service",
  entity: "service",
  schema: serviceSchema,
  paths: ["/admin/services"],
  labelField: "title",
  toData: (v) => ({
    icon: v.icon,
    title: v.title,
    description: v.description,
    features: v.features,
  }),
};

export async function createService(values: Record<string, unknown>) {
  return crudCreate(cfg, values);
}
export async function updateService(id: string, values: Record<string, unknown>) {
  return crudUpdate(cfg, id, values);
}
export async function deleteService(id: string) {
  return crudDelete(cfg, id);
}
