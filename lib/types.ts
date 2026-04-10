export const NAME_FIELDS = ["firstName", "lastName"] as const;
export type NameField = (typeof NAME_FIELDS)[number];

export const ADDRESS_FIELDS = ["number", "street", "city", "state"] as const;
export type AddressField = (typeof ADDRESS_FIELDS)[number];

export const PHONE_FIELDS = ["phone", "mobile"] as const;
export type PhoneField = (typeof PHONE_FIELDS)[number];

export const ACCOUNT_TABS = ["bookings", "profile"] as const;
export type AccountTab = (typeof ACCOUNT_TABS)[number];

export interface Address {
  number: string;
  street: string;
  city: string;
  state: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  address: Address;
  phone: string;
  mobile: string;
  email: string;
  message: string;
}

export interface BookingFormState {
  firstName: string;
  lastName: string;
  address: Address;
  phone: string;
  mobile: string;
  email: string;
  birthDate: string;
  comments: string;
  discountCode: string;
  specialOffers: boolean;
  cancellation: boolean;
  acceptTerms: boolean;
  payFullNow: boolean;
  adults: number;
  children: number;
  options: Record<string, boolean>;
}

export interface ProfileApiUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  mobile: string | null;
  birthDate: string | null;
  addressNumber: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
}

export interface ProfileResponse {
  user: ProfileApiUser | null;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  mobile: string;
  birthDate: string;
  addressNumber: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  email: string;
}

export type ProfileUpdatePayload = Partial<Omit<ProfileFormData, "email">>;

export interface OptionRecord {
  id: string;
  name: string;
  priceHt: number;
  description?: string | null;
}

export interface ReservationPricing {
  basePriceHt: number;
  optionSumHt: number;
  subtotalHt: number;
  tvaHt: number;
  taxSejourTtc: number;
  total: number;
}

export interface ReservationPricingSummary extends ReservationPricing {
  nights: number;
  deposit: number;
  balance: number;
}

export interface ReservationCreatePayload {
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  optionIds: string[];
  pricing: ReservationPricing;
}

export interface ReservationOptionSerialized {
  id: string;
  optionId: string;
  reservationId: string;
  quantity: number;
  totalPriceHt: number;
  option: Required<OptionRecord>;
}

export interface ReservationSerialized {
  id: string;
  userId: string;
  bookingRef?: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  basePriceHt: number;
  optionsPriceHt: number;
  subtotalHt: number;
  tvaHt: number;
  taxSejourTtc: number;
  totalTtc: number;
  depositAmount: number;
  balanceAmount: number;
  securityDeposit: number;
  createdAt: string;
  items: ReservationOptionSerialized[];
}

export interface ApiErrorResponse {
  error: string;
}
