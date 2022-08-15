export interface Game {
  id: string;
  date_created: Date | string;
  date_last_played: Date | string | null;
  title: string;
  description: string;
  file: File | string | null;
  cover: File | string | null;
  screenshots: (File | string)[];
  tagToAdd?: string;
  tags: string[];
}
