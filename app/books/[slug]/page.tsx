import { Metadata } from "next";
import { notFound } from "next/navigation";

import Title from "../../../components/Title";
import BookNotes from "../../../components/books/BookNotes";
import { getBookById } from "../../../utils/getBooks";

const Page = async ({ params }: { params: { slug: string } }) => {
  const book = await getBookById(params.slug);

  if (!book || !book.notes) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="min-h-screen flex-col flex">
        <Title leftSide={<span>{book.title}</span>} />

        <div className="h-full my-10 mx-auto w-11/12 sm:w-8/12">
          <p className="uppercase tracking-wide text-sm mb-8">{book.author}</p>
          <BookNotes notes={book.notes} />
        </div>
      </div>
    </div>
  );
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const book = await getBookById(params.slug);
  return {
    title: book?.title || "Book notes",
  };
}

export default Page;
