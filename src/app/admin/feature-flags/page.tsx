import AdminFeatureFlags from "@/components/admin/AdminFeatureFlags";
import { requireSuperAdmin } from "@/lib/admin";
import { listFeatureFlags } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export default async function AdminFeatureFlagsPage() {
  await requireSuperAdmin();
  const flags = await listFeatureFlags();

  return (
    <div className="space-y-5">
      <header>
        <p className="admin-eyebrow">Super admin</p>
        <h1 className="mt-2 text-3xl">Feature flags</h1>
        <p className="admin-muted mt-2 text-sm">
          Ces interrupteurs changent le comportement public du site.
        </p>
      </header>

      <AdminFeatureFlags flags={flags} />
    </div>
  );
}
