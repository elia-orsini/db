#!/usr/bin/env node
/**
 * Sync films rated ≥ 4★ from Letterboxd (username: eorsini) into data/films.json.
 *
 * Letterboxd HTML is Cloudflare-protected, so this script uses the public RSS
 * diary feed (reliable from CI) and merges into the existing JSON so older
 * favourites are preserved when they fall out of the RSS window.
 *
 * Optional: set TMDB_API_KEY to replace portrait-only Letterboxd posters with
 * TMDB backdrop (wide) images. Free key: https://www.themoviedb.org/settings/api
 *
 * Usage: node scripts/fetch-letterboxd-films.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const USERNAME = "eorsini";
const MIN_RATING = 4;
const RSS_URL = `https://letterboxd.com/${USERNAME}/rss/`;
const TMDB_IMG = "https://image.tmdb.org/t/p/w1280";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = join(ROOT, "data", "films.json");

const UA =
  "Mozilla/5.0 (compatible; el-db-letterboxd-sync/1.0; +https://github.com/)";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = val;
  }
}

loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));

function enlargePoster(src) {
  if (!src) return "";
  return src.replace(/-0-\d+-0-\d+-crop/, "-0-600-0-900-crop");
}

/** True when the image is already a landscape/wide cover. */
function isWideCover(url) {
  if (!url) return false;
  if (/image\.tmdb\.org/.test(url)) return true;
  if (/1200-1200-675-675-crop/.test(url)) return true;
  const m = url.match(/-0-(\d+)-0-(\d+)-crop/);
  if (m) return Number(m[1]) >= Number(m[2]);
  return false;
}

function preferImg(prev, next) {
  if (isWideCover(prev) && !isWideCover(next)) return prev;
  if (next) return next;
  return prev || "";
}

function decodeXml(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

function tag(block, name) {
  const cdata = block.match(
    new RegExp(
      `<${name}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${name}>`,
      "i"
    )
  );
  if (cdata) return decodeXml(cdata[1].trim());

  const plain = block.match(
    new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i")
  );
  return plain ? decodeXml(plain[1].trim()) : "";
}

function parseRss(xml) {
  const items = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  for (const block of blocks) {
    const ratingRaw = tag(block, "letterboxd:memberRating");
    const rating = ratingRaw ? Number(ratingRaw) : NaN;
    if (!Number.isFinite(rating) || rating < MIN_RATING) continue;

    const name = tag(block, "letterboxd:filmTitle");
    const yearRaw = tag(block, "letterboxd:filmYear");
    const year = yearRaw ? Number(yearRaw) : null;
    const tmdbRaw = tag(block, "tmdb:movieId");
    const tmdbId = tmdbRaw ? Number(tmdbRaw) : null;
    const watchedAt = tag(block, "letterboxd:watchedDate") || null;
    const reviewUrl = tag(block, "link");
    const description = tag(block, "description");
    const imgMatch = description.match(/src="([^"]+)"/i);
    const img = enlargePoster(imgMatch?.[1] || "");

    let url = reviewUrl;
    const slugFromReview = reviewUrl.match(
      new RegExp(`/${USERNAME}/film/([^/]+)/?`)
    );
    if (slugFromReview) {
      url = `https://letterboxd.com/film/${slugFromReview[1]}/`;
    }

    const id =
      url.match(/letterboxd\.com\/film\/([^/]+)/)?.[1] ||
      slugFromReview?.[1] ||
      name.toLowerCase().replace(/\s+/g, "-");

    items.push({
      id,
      name,
      url,
      img,
      rating,
      watchedAt,
      year: Number.isFinite(year) ? year : null,
      tmdbId: Number.isFinite(tmdbId) ? tmdbId : null,
    });
  }

  return items;
}

function loadExisting() {
  if (!existsSync(OUT_PATH)) return [];
  try {
    const data = JSON.parse(readFileSync(OUT_PATH, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function mergeFilms(existing, fromRss) {
  const byId = new Map();

  for (const film of existing) {
    if (!film?.id) continue;
    byId.set(film.id, { ...film });
  }

  for (const film of fromRss) {
    const prev = byId.get(film.id);
    byId.set(film.id, {
      id: film.id,
      name: film.name || prev?.name || film.id,
      url: film.url || prev?.url || "",
      img: preferImg(prev?.img, film.img),
      rating: film.rating,
      watchedAt: film.watchedAt || prev?.watchedAt || null,
      year: film.year ?? prev?.year ?? null,
      director: prev?.director ?? null,
      tmdbId: film.tmdbId ?? prev?.tmdbId ?? null,
      ...(prev?.position != null && film.watchedAt == null
        ? { position: prev.position }
        : {}),
    });
  }

  const films = [...byId.values()].filter(
    (f) => Number(f.rating) >= MIN_RATING
  );

  films.sort((a, b) => {
    if (a.watchedAt && b.watchedAt) {
      return a.watchedAt < b.watchedAt ? 1 : a.watchedAt > b.watchedAt ? -1 : 0;
    }
    if (a.watchedAt && !b.watchedAt) return -1;
    if (!a.watchedAt && b.watchedAt) return 1;
    const pa = a.position ?? Number.MAX_SAFE_INTEGER;
    const pb = b.position ?? Number.MAX_SAFE_INTEGER;
    return pa - pb;
  });

  return films.map(({ position, ...rest }, index) => ({
    ...rest,
    position: index,
  }));
}

async function tmdbFetch(path, apiKey) {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  url.searchParams.set("api_key", apiKey);
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": UA },
  });
  if (!res.ok) {
    throw new Error(`TMDB ${path} → ${res.status}`);
  }
  return res.json();
}

async function resolveTmdbBackdrop(film, apiKey) {
  let tmdbId = film.tmdbId;

  if (!tmdbId) {
    const params = new URLSearchParams({ query: film.name });
    if (film.year) params.set("year", String(film.year));
    const data = await tmdbFetch(`/search/movie?${params}`, apiKey);
    const hit = data.results?.[0];
    if (!hit?.id) return null;
    tmdbId = hit.id;
    if (hit.backdrop_path) {
      return {
        tmdbId,
        img: `${TMDB_IMG}${hit.backdrop_path}`,
      };
    }
  }

  const details = await tmdbFetch(`/movie/${tmdbId}`, apiKey);
  if (!details.backdrop_path) return null;
  return {
    tmdbId,
    img: `${TMDB_IMG}${details.backdrop_path}`,
  };
}

async function resolveTmdbCredits(film, apiKey) {
  let tmdbId = film.tmdbId;
  if (!tmdbId) {
    const params = new URLSearchParams({ query: film.name });
    if (film.year) params.set("year", String(film.year));
    const data = await tmdbFetch(`/search/movie?${params}`, apiKey);
    const hit = data.results?.[0];
    if (!hit?.id) return null;
    tmdbId = hit.id;
    if (!film.year && hit.release_date) {
      film.year = Number(hit.release_date.slice(0, 4));
    }
  }

  const credits = await tmdbFetch(`/movie/${tmdbId}/credits`, apiKey);
  const directors = (credits.crew || [])
    .filter((c) => c.job === "Director")
    .map((c) => c.name)
    .filter(Boolean)
    .slice(0, 2);

  return {
    tmdbId,
    director: directors.length ? directors.join(", ") : null,
  };
}

async function enrichWithTmdb(films) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.log(
      "TMDB_API_KEY not set — skipping backdrop/director enrichment."
    );
    return films;
  }

  const needingBackdrop = films.filter((f) => !isWideCover(f.img));
  const needingMeta = films.filter((f) => !f.director || !f.year);
  const needing = [
    ...new Map(
      [...needingBackdrop, ...needingMeta].map((f) => [f.id, f])
    ).values(),
  ];

  console.log(
    `TMDB: enriching ${needing.length} films (backdrop and/or director/year)`
  );

  let updated = 0;
  for (const film of needing) {
    try {
      if (!isWideCover(film.img)) {
        const backdrop = await resolveTmdbBackdrop(film, apiKey);
        if (backdrop) {
          film.img = backdrop.img;
          film.tmdbId = backdrop.tmdbId;
        }
      }

      if (!film.director || !film.year) {
        const credits = await resolveTmdbCredits(film, apiKey);
        if (credits) {
          film.tmdbId = credits.tmdbId;
          if (credits.director) film.director = credits.director;
        }
      }

      updated += 1;
      await new Promise((r) => setTimeout(r, 120));
    } catch (err) {
      console.warn(`  ✗ ${film.name}: ${err.message}`);
    }
  }

  console.log(`TMDB: processed ${updated}/${needing.length}`);
  return films;
}

async function main() {
  console.log(`Fetching ${RSS_URL}`);
  const res = await fetch(RSS_URL, {
    headers: {
      "User-Agent": UA,
      Accept: "application/rss+xml, application/xml",
    },
  });
  if (!res.ok) {
    throw new Error(`RSS fetch failed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  const fromRss = parseRss(xml);
  console.log(`RSS: ${fromRss.length} films with rating ≥ ${MIN_RATING}`);

  const existing = loadExisting();
  console.log(`Existing: ${existing.length} films in ${OUT_PATH}`);

  let merged = mergeFilms(existing, fromRss);
  merged = await enrichWithTmdb(merged);

  mkdirSync(dirname(OUT_PATH), { recursive: true });

  const next = `${JSON.stringify(merged, null, 2)}\n`;
  const prev = existsSync(OUT_PATH) ? readFileSync(OUT_PATH, "utf8") : "";
  if (prev === next) {
    console.log("No changes.");
    return;
  }

  writeFileSync(OUT_PATH, next);
  console.log(`Wrote ${merged.length} films → ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
