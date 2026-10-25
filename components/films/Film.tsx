const Film: React.FC<{
  link: string;
  img: string;
  title: string;
  year?: number | null;
  director?: string | null;
}> = ({ link, img, title, year, director }) => {
  const heading = year ? `${title} (${year})` : title;

  return (
    <div className="flex flex-col mx-auto border border-black w-72">
      <a href={link} target="_blank" rel="noreferrer">
        <img
          width={300}
          alt={heading}
          src={img}
          className="w-72 sm:h-40 mx-auto border border-black z-0 object-contain bg-black cursor-pointer"
        />
      </a>

      <h1 className="font-black text-center text-lg uppercase mt-2 tracking-tight px-2">
        {heading}
      </h1>

      {director ? (
        <p className="mx-auto mb-2 mt-1 text-center text-xs uppercase tracking-wide px-2">
          {director}
        </p>
      ) : (
        <div className="h-7"></div>
      )}
    </div>
  );
};

export default Film;
