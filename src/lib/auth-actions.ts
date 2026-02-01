"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { i18n } from "@/i18n/config";

const AUTH_COOKIE_NAME = "auth_session";

export async function login(formData: FormData) {
  const secretKey = formData.get("secretKey") as string;
  const lang = (formData.get("lang") as string) || i18n.defaultLocale;

  if (secretKey === process.env.AUTH_SECRET_KEY?.trim()) {
    // Set a secure cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    redirect(`/${lang}/dashboard`);
  } else {
    return { error: "Invalid Secret Key" };
  }
}

export async function logout(formData?: FormData) {
  const cookieStore = await cookies();

  let lang = i18n.defaultLocale;
  if (formData) {
    const langParam = formData.get("lang");
    if (langParam && typeof langParam === "string") {
      lang = langParam;
    }
  }

  cookieStore.delete(AUTH_COOKIE_NAME);
  redirect(`/${lang}/login`);
}

export async function logoutWithLang(lang: string) {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  redirect(`/${lang}/login`);
}
