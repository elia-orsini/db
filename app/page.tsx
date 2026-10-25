"use client";
import React from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import Title from "../components/Title";

const IndexPage = () => {
  useGSAP(() => {}, []);

  return (
    <div className="h-screen min-h-screen flex-col flex">
      <Title linkLogo={false} />

      <div className="mx-auto px-2 text-xl w-full sm:w-4/5 md:w-3/5 text-left border-dashed border-b sm:border-r sm:border-l border-black">
        <p>
          Just a simple website collecting books I read / films I watch / coffee
          I drink.
        </p>
      </div>

      <div
        className={`flex flex-col m-auto w-full sm:w-4/5 md:w-3/5 h-full border-dashed sm:border-r sm:border-l border-black`}
      >
        <div className="flex flex-col my-auto leading-tight text-[7rem] sm:text-[9rem]">
          <Link
            href="/films"
            passHref
            className="mainTitle mx-auto cursor-pointer lowercase hover:text-gray-700"
          >
            Films
          </Link>

          <Link
            href="/cafes"
            passHref
            className="mainTitle mx-auto cursor-pointer lowercase hover:text-gray-700"
          >
            Cafes
          </Link>

          <Link
            href="/books"
            passHref
            className="mainTitle mx-auto cursor-pointer lowercase hover:text-gray-700"
          >
            Books
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
