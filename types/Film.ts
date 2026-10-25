export interface IFilm {
  id: string;
  name: string;
  url: string;
  img: string;
  rating: number;
  watchedAt?: string | null;
  year?: number | null;
  director?: string | null;
  tmdbId?: number | null;
  position?: number;
}
