import { getBooksByYear } from "../../../../utils/getBooks";

export const revalidate = 60;

export async function GET() {
  const byYear = await getBooksByYear();
  const reading = Object.values(byYear)
    .flat()
    .filter((book) => !book.date_read)
    .map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
    }));

  return Response.json(reading);
}
