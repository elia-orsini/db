import films from "../../../data/films.json";

const RECENT_COUNT = 5;

export const revalidate = 60;

export async function GET() {
  const recent = films.slice(0, RECENT_COUNT).map((film) => ({
    id: film.id,
    name: film.name,
    year: film.year ?? null,
    director: film.director ?? null,
    url: film.url,
    rating: film.rating,
    watchedAt: film.watchedAt ?? null,
  }));

  return Response.json(recent);
}
