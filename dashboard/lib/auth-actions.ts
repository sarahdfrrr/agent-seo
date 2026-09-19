"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, expectedSessionToken, verifyPassword } from "@/lib/auth";

function safeNext(next: FormDataEntryValue | null): string {
  const value = String(next ?? "/");
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  const ok = await verifyPassword(password);
  if (!ok) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const token = await expectedSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
