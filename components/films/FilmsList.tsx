import { IFilm } from "../../types/Film";

import Film from "./Film";

const FilmsList: React.FC<{ films: IFilm[] }> = ({ films }) => {
  return (
    <div className="flex-1 mx-auto my-auto">
      <div className="grid grid-cols-1 w-max mx-auto md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8 my-8">
        {films.map((obj: IFilm) => (
          <Film
            key={obj.id}
            title={obj.name}
            link={obj.url}
            img={obj.img}
            year={obj.year}
            director={obj.director}
          />
        ))}
      </div>
    </div>
  );
};

export default FilmsList;
