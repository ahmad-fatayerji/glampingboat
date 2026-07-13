import AdminFeatureFlags from "@/components/admin/AdminFeatureFlags";
import { requireSuperAdmin } from "@/lib/admin";
import { listFeatureFlags } from "@/lib/feature-flags";
import { getServerLocale } from "@/components/Language/server-locale";
import { tAdmin } from "@/components/admin/admin-i18n";

export const dynamic = "force-dynamic";

export default async function AdminFeatureFlagsPage() {
  await requireSuperAdmin();
  const locale = await getServerLocale();
  const flags = await listFeatureFlags();

  return (
    <div className="space-y-5">
      <header>
        <p className="admin-eyebrow">{tAdmin(locale, "superAdmin")}</p>
        <h1 className="mt-2 text-3xl">{tAdmin(locale, "featureFlags")}</h1>
        <p className="admin-muted mt-2 text-sm">
          {tAdmin(locale, "featureFlagsBody")}
        </p>
      </header>

      <AdminFeatureFlags flags={flags} />
    </div>
  );
}
