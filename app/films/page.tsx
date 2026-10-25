import React from "react";

import Title from "../../components/Title";
import FilmsList from "../../components/films/FilmsList";
import { Metadata } from "next";
import films from "../../data/films.json";

const IndexPage = async () => {
  return (
    <>
      <Title leftSide={<span>{films.length} films</span>} />

      <FilmsList films={films} />
    </>
  );
};

export const metadata: Metadata = {
  title: "Films",
  description: "Films I've rated 4 stars or higher on Letterboxd.",
};

export default IndexPage;
