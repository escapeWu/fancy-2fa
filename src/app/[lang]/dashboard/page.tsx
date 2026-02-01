import { getAccounts } from "@/lib/actions";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const accounts = await getAccounts();
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <DashboardClient initialAccounts={accounts} dict={dict} lang={lang} />;
}
