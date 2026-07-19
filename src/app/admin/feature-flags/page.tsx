import AdminFeatureFlags from "@/components/admin/AdminFeatureFlags";
import { requireSuperAdmin } from "@/lib/admin";
import { listFeatureFlags } from "@/lib/feature-flags";
import { getServerLocale } from "@/components/Language/server-locale";
import { tAdmin } from "@/components/admin/admin-i18n";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminFeatureFlagsPage() {
  await requireSuperAdmin();
  const locale = await getServerLocale();
  const flags = await listFeatureFlags();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={tAdmin(locale, "superAdmin")}
        title={tAdmin(locale, "featureFlags")}
        description={tAdmin(locale, "featureFlagsBody")}
      />

      <AdminFeatureFlags flags={flags} />
    </div>
  );
}
