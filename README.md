# db.eorsini.xyz

Next.js personal database for books, cafes, and films.

## Films (Letterboxd)

`npm run sync:films` merges ratings ≥ 4★ from Letterboxd into `data/films.json` (weekly via GitHub Action).

For films that only have a portrait Letterboxd poster, set `TMDB_API_KEY` (free from [TMDB](https://www.themoviedb.org/settings/api)) in `.env.local` and as the GitHub secret `TMDB_API_KEY` to fill wide backdrops.