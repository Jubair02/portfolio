import { auth } from "@/auth";

/** Throw unless a valid admin session is present. Use at the top of actions. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorized.");
  return session.user;
}

export type ActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};
