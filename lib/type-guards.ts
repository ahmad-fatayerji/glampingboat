export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getString(
  value: Record<string, unknown>,
  key: string
): string | undefined {
  const field = value[key];
  return typeof field === "string" ? field : undefined;
}

export function getNumber(
  value: Record<string, unknown>,
  key: string
): number | undefined {
  const field = value[key];
  return typeof field === "number" && Number.isFinite(field) ? field : undefined;
}

export function getStringArray(
  value: Record<string, unknown>,
  key: string
): string[] {
  const field = value[key];

  if (!Array.isArray(field)) {
    return [];
  }

  return field.filter((item): item is string => typeof item === "string");
}
