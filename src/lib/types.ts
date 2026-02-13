export type Event = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

export type Device = {
  id: string;
  device_identifier: string;
  device_type: "nfc" | "web" | "ios" | "android";
  profile_id: string | null;
  label: string | null;
  created_at: string;
};

export type CheckIn = {
  id: string;
  event_id: string;
  device_id: string;
  profile_id: string | null;
  checked_in_at: string;
  source: "nfc" | "qr_web";
};

export type CheckInWithDetails = CheckIn & {
  device: Device | null;
  profile: Profile | null;
};
