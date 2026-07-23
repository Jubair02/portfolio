import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/Field";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ChangePassword } from "@/components/admin/profile/ChangePassword";
import type { FieldConfig } from "@/components/admin/EntityManager";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

const fields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "image", label: "Profile picture", type: "image", folder: "portfolio/admin" },
];

export default async function ProfileAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your admin account." />
      <SettingsForm
        fields={fields}
        initial={{
          name: user?.name ?? "",
          email: user?.email ?? "",
          image: user?.image ?? "",
        }}
        action={updateProfile}
      />
      <ChangePassword />
    </div>
  );
}
