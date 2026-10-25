"use client";
import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { BooksByYear, IBook } from "../../types/Book";
import Book from "../Book";

import BooksStats from "./BooksStats";
import BooksSwitchButton from "./BooksSwitchButton";
import getDayOfYear from "../../utils/getDayOfYear";

const BooksList: React.FC<{
  books: BooksByYear;
}> = ({ books }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const years = useMemo(
    () => Object.keys(books).sort((a, b) => b.localeCompare(a)),
    [books]
  );

  const yearFromUrl = searchParams.get("year");
  const thisYear =
    (yearFromUrl && years.includes(yearFromUrl) && yearFromUrl) ||
    years[0] ||
    "";

  const currentYearData = useMemo(
    () => (thisYear ? books[thisYear] ?? [] : null),
    [thisYear, books]
  );

  const setThisYear = useCallback(
    (year: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (year) {
        params.set("year", year);
      } else {
        params.delete("year");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (!yearFromUrl && years[0]) {
      setThisYear(years[0]);
    }
  }, [yearFromUrl, years, setThisYear]);

  return (
    <div className="h-full mx-auto w-max flex flex-col justify-start mt-4">
      <div className="flex mb-2 mx-auto">
        <BooksSwitchButton
          setState={setThisYear}
          state={thisYear}
          states={years}
        />
      </div>

      {currentYearData && (
        <BooksStats
          thisYear={thisYear === String(new Date().getFullYear())}
          booksToRead={10}
          currentYearData={currentYearData}
        />
      )}

      {currentYearData && (
        <div className="mx-auto mt-6 mb-6">
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
      )}

      {currentYearData && currentYearData.length > 0 && (
        <div className="p-2 sm:p-4 border border-black bg-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-8 mb-8">
          {currentYearData.map((book: IBook) => {
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
      )}
    </div>
  );
};

export default BooksList;
