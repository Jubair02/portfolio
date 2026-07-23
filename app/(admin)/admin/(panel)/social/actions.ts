"use server";

import { crudCreate, crudUpdate, crudDelete, type CrudConfig } from "@/lib/crud";
import { socialSchema, type SocialFormValues } from "@/lib/schemas/collections";

const cfg: CrudConfig<SocialFormValues> = {
  model: "socialLink",
  entity: "social link",
  schema: socialSchema,
  paths: ["/admin/social"],
  labelField: "platform",
  toData: (v) => ({
    platform: v.platform,
    url: v.url,
    icon: v.icon || null,
    visible: v.visible,
  }),
};

export async function createSocial(values: Record<string, unknown>) {
  return crudCreate(cfg, values);
}
export async function updateSocial(id: string, values: Record<string, unknown>) {
  return crudUpdate(cfg, id, values);
}
export async function deleteSocial(id: string) {
  return crudDelete(cfg, id);
}
