import type { Prisma } from "@/generated/prisma/client";
import type {
  BookingFormState,
  ProfileApiUser,
  ProfileFormData,
  ProfileUpdatePayload,
} from "@/lib/types";
import type { TranslationKey } from "@/components/Language/dictionaries";

export const USER_PROFILE_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  mobile: true,
  birthDate: true,
  addressNumber: true,
  addressStreet: true,
  addressCity: true,
  addressState: true,
} satisfies Prisma.UserSelect;

export const PROFILE_COMPLETENESS_SELECT = {
  firstName: true,
  lastName: true,
  phone: true,
  addressCity: true,
  addressStreet: true,
} satisfies Prisma.UserSelect;

export type UserProfileRecord = Prisma.UserGetPayload<{
  select: typeof USER_PROFILE_SELECT;
}>;

export type ProfileCompletenessRecord = Prisma.UserGetPayload<{
  select: typeof PROFILE_COMPLETENESS_SELECT;
}>;

export type ProfileRequiredFieldPath =
  | "firstName"
  | "lastName"
  | "phone"
  | "address.street"
  | "address.city";

export const PROFILE_REQUIRED_FIELDS = [
  { key: "firstName", labelKey: "firstName" },
  { key: "lastName", labelKey: "lastName" },
  { key: "phone", labelKey: "phone" },
  { key: "address.street", labelKey: "street" },
  { key: "address.city", labelKey: "city" },
] as const satisfies ReadonlyArray<{
  key: ProfileRequiredFieldPath;
  labelKey: TranslationKey;
}>;

export function isProfileComplete(profile: ProfileCompletenessRecord | null) {
  return Boolean(
    profile?.firstName &&
      profile.lastName &&
      profile.phone &&
      profile.addressCity &&
      profile.addressStreet
  );
}

export function toProfileApiUser(
  user: UserProfileRecord | null
): ProfileApiUser | null {
  if (!user) {
    return null;
  }

  return {
    ...user,
    birthDate: user.birthDate ? user.birthDate.toISOString() : null,
  };
}

export function createEmptyProfileFormData(): ProfileFormData {
  return {
    firstName: "",
    lastName: "",
    phone: "",
    mobile: "",
    birthDate: "",
    addressNumber: "",
    addressStreet: "",
    addressCity: "",
    addressState: "",
    email: "",
  };
}

export function toProfileFormData(
  user: ProfileApiUser | null | undefined
): ProfileFormData {
  const empty = createEmptyProfileFormData();

  if (!user) {
    return empty;
  }

  return {
    ...empty,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
    mobile: user.mobile ?? "",
    birthDate: user.birthDate ? user.birthDate.substring(0, 10) : "",
    addressNumber: user.addressNumber ?? "",
    addressStreet: user.addressStreet ?? "",
    addressCity: user.addressCity ?? "",
    addressState: user.addressState ?? "",
    email: user.email ?? "",
  };
}

export function toProfileUpdatePayload(
  data: Pick<
    ProfileFormData,
    | "firstName"
    | "lastName"
    | "phone"
    | "mobile"
    | "birthDate"
    | "addressNumber"
    | "addressStreet"
    | "addressCity"
    | "addressState"
  >
): ProfileUpdatePayload {
  return {
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
    phone: data.phone || undefined,
    mobile: data.mobile || undefined,
    birthDate: data.birthDate || undefined,
    addressNumber: data.addressNumber || undefined,
    addressStreet: data.addressStreet || undefined,
    addressCity: data.addressCity || undefined,
    addressState: data.addressState || undefined,
  };
}

export function getProfileFieldValue(
  form: Pick<BookingFormState, "firstName" | "lastName" | "phone" | "address">,
  path: ProfileRequiredFieldPath
) {
  switch (path) {
    case "address.street":
      return form.address.street;
    case "address.city":
      return form.address.city;
    default:
      return form[path];
  }
}

export function getMissingProfileFields(
  form: Pick<BookingFormState, "firstName" | "lastName" | "phone" | "address">
) {
  return PROFILE_REQUIRED_FIELDS.filter(
    ({ key }) => !getProfileFieldValue(form, key).trim()
  ).map(({ key }) => key);
}
