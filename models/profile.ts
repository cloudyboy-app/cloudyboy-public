export interface Profile {
  id: string;
  date_created: Date | string;
  raw_user_meta_data: {
    avatar_url: string;
    full_name: string;
    email_verified: boolean;
  };
}
