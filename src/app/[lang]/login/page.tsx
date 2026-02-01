import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";

export default async function LoginPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
       <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
            <Link href={`/${lang}`} className="flex items-center gap-2 text-primary">
                <Logo className="h-8 w-8" />
                <span className="text-2xl font-bold tracking-tight">{dict.login.title}</span>
            </Link>
        </div>
        <LoginForm dict={dict} lang={lang} />
      </div>
    </div>
  );
}
