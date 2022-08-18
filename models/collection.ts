import { Game } from './game';
import { Profile } from './profile';

export interface Collection {
  id: string;
  date_created: Date | string;
  title: string;
  description: string;
  owner_id: string;
  owner: Profile;
  games: Game[];
  favorited_by: Profile[];
}
