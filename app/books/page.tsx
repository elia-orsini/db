import React, { Suspense } from "react";

import Title from "../../components/Title";
import BooksList from "../../components/books/BooksList";
import { getBooksByYear } from "../../utils/getBooks";
import { Metadata } from "next";

const Books = async () => {
  const books = await getBooksByYear();
  const allBooks = Object.values(books).flat();

  return (
    <div className="flex flex-col min-h-screen justify-between">
      <div className="w-full">
        <Title leftSide={<>{allBooks.length} books</>} />

        <Suspense>
          <BooksList books={books} />
        </Suspense>
      </div>
    </div>
  );
};

export const metadata: Metadata = {
  title: "Books",
  description: "Keeping track of the books I read while I save the good bits.",
};

export default Books;
