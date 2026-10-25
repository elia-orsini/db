import { BooksByYear, IBook } from "../types/Book";
import { sanity } from "./sanity";

type SanityBook = {
  id?: string;
  _key?: string;
  title?: string;
  author?: string;
  dateRead?: string;
  hasNotes?: boolean;
  notes?: string;
};

type SanityYearGroup = {
  year?: string;
  books?: SanityBook[];
};

export type { BooksByYear };

function mapBook(book: SanityBook): IBook {
  return {
    id: book.id || book._key || "",
    title: book.title || "Untitled",
    author: book.author || "Unknown",
    date_read: book.dateRead || "",
    link: Boolean(book.hasNotes || book.notes),
    notes: book.notes || "",
  };
}

export async function getBooksByYear(): Promise<BooksByYear> {
  const doc = await sanity.fetch<{ yearGroups?: SanityYearGroup[] } | null>(
    `*[_id == "books"][0]{
      yearGroups[]{
        year,
        books[]{ id, _key, title, author, dateRead, hasNotes, notes }
      }
    }`,
    {},
    { next: { revalidate: 30 } }
  );

  const byYear: BooksByYear = {};

  for (const group of doc?.yearGroups || []) {
    if (!group.year) continue;
    byYear[group.year] = (group.books || []).map(mapBook);
  }

  return byYear;
}

export async function getBookById(id: string): Promise<IBook | null> {
  const byYear = await getBooksByYear();
  for (const books of Object.values(byYear)) {
    const match = books.find((book) => book.id === id);
    if (match) return match;
  }
  return null;
}
