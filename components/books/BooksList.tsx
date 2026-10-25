"use client";
import { useEffect, useMemo, useState } from "react";

import { BooksByYear, IBook } from "../../types/Book";
import Book from "../Book";

import BooksStats from "./BooksStats";
import BooksSwitchButton from "./BooksSwitchButton";
import getDayOfYear from "../../utils/getDayOfYear";

const BooksList: React.FC<{
  books: BooksByYear;
}> = ({ books }) => {
  const years = useMemo(
    () => Object.keys(books).sort((a, b) => b.localeCompare(a)),
    [books]
  );
  const [thisYear, setThisYear] = useState(years[0] || "");
  const [currentYearData, setCurrentYearData] = useState<IBook[]>([]);

  useEffect(() => {
    if (!thisYear && years[0]) setThisYear(years[0]);
  }, [thisYear, years]);

  useEffect(() => {
    setCurrentYearData(books[thisYear] || []);
  }, [thisYear, books]);

  return (
    <div className="h-full flex flex-col justify-start mt-4">
      <BooksStats
        thisYear={false}
        booksToRead={15}
        currentYearData={currentYearData}
      />

      <div className="mx-auto mt-6">
        <hr className="w-72 mx-auto border-black" />

        <div className="mx-auto w-72 -mt-1">
          {currentYearData.length > 0 &&
            currentYearData.map((book: IBook) => {
              if (!book.date_read) return null;
              return (
                <div
                  key={book.id}
                  style={{
                    marginLeft: `${Math.floor(
                      (getDayOfYear(new Date(book.date_read)) / 365) * 281
                    )}px`,
                  }}
                  className={`absolute bg-black w-2 opacity-40 h-2 rounded-full`}
                />
              );
            })}
        </div>
      </div>

      <div className="flex my-6">
        <BooksSwitchButton
          setState={setThisYear}
          state={thisYear}
          states={years}
        />
      </div>

      <div className="text-center mx-auto my-auto mb-8 grid md:grid-cols-2 lg:grid-cols-3 gap-2">
        {currentYearData.length > 0 &&
          currentYearData.map((book: IBook) => {
            return (
              <Book
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                dateFinished={book.date_read}
                link={book.link}
              />
            );
          })}
      </div>
    </div>
  );
};

export default BooksList;
