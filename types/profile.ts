export type AgeBand = "8-12" | "13-17";

export type Profile = {
  id: string;
  auth_user_id: string | null;
  parent_profile_id: string | null;
  is_child: boolean;
  display_name: string;
  age_band: AgeBand | null;
  phone: string | null;
  whatsapp_opt_in: boolean;
  country: string | null;
  created_at: string;
};
