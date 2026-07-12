import { prisma } from "@/lib/prisma";

export const FEATURE_FLAG_KEYS = ["bookingEnabled"] as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];

const FEATURE_FLAG_DEFAULTS: Record<
  FeatureFlagKey,
  { enabled: boolean; description: string; label: string }
> = {
  bookingEnabled: {
    enabled: true,
    description: "Allow customers to create new bookings",
    label: "Booking",
  },
};

export function isFeatureFlagKey(value: string): value is FeatureFlagKey {
  return FEATURE_FLAG_KEYS.includes(value as FeatureFlagKey);
}

function isMissingFeatureFlagTableError(error: unknown) {
  return (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2021"
  );
}

export async function isFeatureEnabled(key: FeatureFlagKey) {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key },
      select: { enabled: true },
    });

    return flag?.enabled ?? FEATURE_FLAG_DEFAULTS[key].enabled;
  } catch (error) {
    if (isMissingFeatureFlagTableError(error)) {
      return FEATURE_FLAG_DEFAULTS[key].enabled;
    }

    throw error;
  }
}

export async function listFeatureFlags() {
  const flags = await Promise.all(
    FEATURE_FLAG_KEYS.map((key) =>
      prisma.featureFlag.upsert({
        where: { key },
        create: {
          key,
          enabled: FEATURE_FLAG_DEFAULTS[key].enabled,
          description: FEATURE_FLAG_DEFAULTS[key].description,
        },
        update: {},
      })
    )
  );

  return flags.map((flag, index) => {
    const key = FEATURE_FLAG_KEYS[index];

    return {
      ...flag,
      key,
      label: FEATURE_FLAG_DEFAULTS[key].label,
      description: flag.description ?? FEATURE_FLAG_DEFAULTS[key].description,
      updatedAt: flag.updatedAt.toISOString(),
    };
  });
}

export async function setFeatureFlag(
  key: FeatureFlagKey,
  enabled: boolean,
  updatedByUserId: string
) {
  return prisma.featureFlag.upsert({
    where: { key },
    create: {
      key,
      enabled,
      description: FEATURE_FLAG_DEFAULTS[key].description,
      updatedByUserId,
    },
    update: {
      enabled,
      updatedByUserId,
    },
  });
}
