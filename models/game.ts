import { Profile } from './profile';

export interface Game {
  id: string;
  uploader_id: string;
  uploader: Profile;
  date_created: Date | string;
  title: string;
  description: string;
  file: File | string | null;
  cover: File | string | null;
  screenshots: (File | string)[];
  tagToAdd?: string;
  tags: string[];
}
