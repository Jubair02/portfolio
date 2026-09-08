"use server";

import { crudCreate, crudUpdate, crudDelete, crudReorder, type CrudConfig } from "@/lib/crud";
import { certificateSchema, type CertificateFormValues } from "@/lib/schemas/collections";

const cfg: CrudConfig<CertificateFormValues> = {
  model: "certificate",
  entity: "certificate",
  schema: certificateSchema,
  paths: ["/admin/certificates"],
  labelField: "title",
  toData: (v) => ({
    title: v.title,
    organization: v.organization,
    date: v.date,
    image: v.image || null,
    credentialUrl: v.credentialUrl || null,
    icon: v.icon,
  }),
};

export async function createCertificate(values: Record<string, unknown>) {
  return crudCreate(cfg, values);
}
export async function updateCertificate(id: string, values: Record<string, unknown>) {
  return crudUpdate(cfg, id, values);
}
export async function deleteCertificate(id: string) {
  return crudDelete(cfg, id);
}
/** `ids` in the new display order. */
export async function reorderCertificates(ids: string[]) {
  return crudReorder(cfg, ids);
}
