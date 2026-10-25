const BooksStats: React.FC<{
  thisYear: boolean;
  booksToRead: number;
  currentYearData: any;
}> = ({ thisYear, booksToRead, currentYearData }) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDay = new Date(new Date().getFullYear(), 0, 1);
  const secondDate = new Date();

  // @ts-ignore
  const passedDays = Math.round(Math.abs((firstDay - secondDate) / oneDay));

  const booksRead =
    currentYearData != null ? currentYearData.length : undefined;

  return (
    <div className="mx-auto mt-4 w-72 border border-black divide-x divide-black text-center grid grid-cols-3">
      <div>
        <p className="text-3xl font-black">
          {booksRead != null ? booksRead : "—"}
        </p>
        <p className="text-xs -mt-1">books read</p>
      </div>

      <div className="">
        <p className="text-3xl font-black">{thisYear ? booksToRead : "—"}</p>
        <p className="text-xs -mt-1">books to read</p>
      </div>

      <div>
        <p className="text-3xl font-black">{thisYear ? passedDays : "—"}</p>
        <p className="text-xs -mt-1">days passed</p>
      </div>
    </div>
  );
};

export default BooksStats;
