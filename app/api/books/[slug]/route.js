import { getBookById, getBooksByYear } from "../../../utils/getBooks";

export async function GET(_request, { params }) {
  const slug = params.slug;
  const byYear = await getBooksByYear();

  if (byYear[slug]) {
    return Response.json(byYear[slug]);
  }

  const book = await getBookById(slug);
  if (book) {
    return Response.json(book);
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
