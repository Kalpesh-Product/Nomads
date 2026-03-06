import React from "react";
import {
  HiOutlineViewGrid,
  HiOutlineHeart,
  HiOutlineUserCircle,
} from "react-icons/hi";
import { LuCircleDollarSign, LuMapPinned } from "react-icons/lu";
// import AiSidebar from "../components/AiSidebar";

const recommendationCards = [
  {
    title: "World Rankings",
    description:
      "WoNo analyzes global data to rank the best destinations worldwide based on livability, popularity, and remote-work potential.",
    icon: HiOutlineViewGrid,
  },
  {
    title: "Best For You",
    description:
      "WoNo evaluates your preferences and recommends destinations that best match your lifestyle and work needs.",
    icon: HiOutlineHeart,
  },
  {
    title: "Increase Your Savings",
    description:
      "WoNo calculates where your income goes further and highlights destinations that help you save more while living well.",
    icon: LuCircleDollarSign,
  },
  {
    title: "Budget Destinations",
    description:
      "WoNo identifies high-value, low-cost destinations that offer strong amenities without high expenses.",
    icon: LuMapPinned,
  },
  {
    title: "Compatible For You",
    description:
      "WoNo matches destinations to your climate, culture, and community preferences for a better overall fit.",
    icon: HiOutlineUserCircle,
  },
  {
    title: "Search Old Style",
    description:
      "WoNo lets you manually filter and sort destinations if you prefer a traditional search approach.",
    icon: HiOutlineViewGrid,
  },
];

const HomeAi = () => {
  return (
    <div className="min-h-full bg-white">
      <main className="px-6 py-10 lg:px-14">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-5xl font-medium text-black/90 font-play">
            hi Abrar
          </h1>
          <h2 className="mt-10 text-3xl font-semibold text-black/85 font-play">
            Let’s start designing your nomad lifestyle
          </h2>

          <div className="mt-16 rounded-[40px] bg-white/60 px-6 py-8 shadow-[0_0_0_1px_rgba(0,0,0,0.03)]">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
              {recommendationCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.title}
                    className="group cursor-pointer text-center"
                  >
                    <Icon
                      size={24}
                      className="mx-auto text-black/80 transition-colors duration-200 group-hover:text-sky-500"
                    />
                    <h3 className="mt-2 text-lg font-bold text-black/90 leading-tight transition-colors duration-200 group-hover:text-sky-500">
                      {card.title}
                    </h3>
                    <div className="mt-4 rounded-2xl bg-[#f1f1f3] p-6 text-left shadow-[0_1px_0_rgba(255,255,255,0.7)] transition-colors duration-200 group-hover:bg-sky-500">
                      <p className="text-xs leading-relaxed text-black/70 transition-colors duration-200 group-hover:text-white">
                        {card.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeAi;
