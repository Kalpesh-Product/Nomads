import React from "react";
import { NavLink } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4 justify-end items-start">
          <p className="uppercase font-semibold text-title lg:text-[6rem] lg:leading-normal">
            WORLDS NOMAD COMMUNITY
          </p>
          <span className="text-[2rem]">
            Connecting Co-working Spaces and Flexible Workers
          </span>
        </div>
        <div className=" rounded-xl overflow-hidden">
          <div className="bg-[url('/images/bg-image.jpg')] bg-cover bg-center h-full w-full rounded-md shadow-md flex items-end">
            <div className="bg-white/10 backdrop-blur-md p-4 w-full flex flex-col gap-4">
              <span className="text-white">
                Serves as a dynamic platform, seamlessly connecting freelance
                professionals, remote workers, and individuals seeking flexible
                workspace
              </span>
              <hr />
              <div className="flex items-center gap-2">
              <div className="p-3 rounded-2xl bg-white">
                <span>Ratings here</span>
              </div>
              <NavLink className={"text-white text-sm hover:underline"}>View More Reviews</NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
