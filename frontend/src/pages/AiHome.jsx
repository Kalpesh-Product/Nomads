import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  PiBuildingOffice,
  PiRanking,
} from "react-icons/pi";
import { TiGlobeOutline } from "react-icons/ti";
import { BiDollar } from "react-icons/bi";
import { RiUserCommunityLine } from "react-icons/ri";
import { TbWorldWww } from "react-icons/tb";
import useNomadLoginState from "../hooks/useNomadLoginState";

const gatedRecommendationTitles = new Set([
  "Work From Anywhere",
  "Increase Your Savings",
  "Advance Your Career",
  "Find Your Community",
]);

const freeRecommendationTitles = new Set([
  "World Ranking",
  "Search Old School",
]);

const recommendationCards = [
  {
    title: "World Ranking",
    description:
      "Global suggestions for the best nomad destinations based on the world index which includes 50+ global factors.",
    icon: PiRanking,
    path: "/search/results",
  },
  {
    title: "Work From Anywhere",
    description:
      "Custom suggestions to help you discover and work from the best nomad destinations.",
    icon: TiGlobeOutline,
    path: "/search/results",
  },
  {
    title: "Increase Your Savings",
    description:
      "Tailored nomad destination suggestions to help you increase your savings as a nomad.",
    icon: BiDollar,
    path: "/search/results",
  },
  {
    title: "Advance Your Career",
    description:
      "Intellegent suggestions to help you find the most sutaible nomad destinations to advance your acreer.",
    icon: PiBuildingOffice,
    path: "/search/results",
  },
  {
    title: "Find Your Community",
    description:
      "Find like minded individuals & communities as per your preferances from nomad destinations.",
    icon: RiUserCommunityLine,
    path: "/search/results",
  },
  {
    title: "Search Old School",
    description:
      "Self search and find your ideal nomad destination as per your preferance like old times.",
    icon: TbWorldWww,
    path: "/manual-search",
  },
];

const AiHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [typedGreeting, setTypedGreeting] = useState("");
  const [typedSubheading, setTypedSubheading] = useState("");

  const [typedThirdLine, setTypedThirdLine] = useState("");
  const [typedFourthLine, setTypedFourthLine] = useState("");

  const isLoggedIn = useNomadLoginState();

  const greetingText = isLoggedIn ? "hi Abrar" : "Meet Wono";
  const subheadingText = isLoggedIn
    ? "Please choose your goals from below so that we can help you design your accurate nomad lifestyle."
    : "An intellegent platform for moden nomads";
  const thirdLineText = isLoggedIn
    ? ""
    : "Supporting the global community of remote workers, creators, entrepreneurs, hosts and investors who are redefining how the world lives and works.";
  const fourthLineText = isLoggedIn
    ? ""
    : "Early adoption of our future lifestyle!";

  useEffect(() => {
    setTypedGreeting("");
    setTypedSubheading("");
    setTypedThirdLine("");
    setTypedFourthLine("");

    let greetingIndex = 0;
    let subheadingIndex = 0;
    let thirdLineIndex = 0;
    let fourthLineIndex = 0;
    let cleanupSubheading = () => {};
    let cleanupThirdLine = () => {};
    let cleanupFourthLine = () => {};

    const greetingInterval = setInterval(() => {
      greetingIndex += 1;
      setTypedGreeting(greetingText.slice(0, greetingIndex));

      if (greetingIndex >= greetingText.length) {
        clearInterval(greetingInterval);

        const subheadingInterval = setInterval(() => {
          subheadingIndex += 1;
          setTypedSubheading(subheadingText.slice(0, subheadingIndex));

          if (subheadingIndex >= subheadingText.length) {
            clearInterval(subheadingInterval);

            if (!thirdLineText) {
              return;
            }

            const thirdLineInterval = setInterval(() => {
              thirdLineIndex += 1;
              setTypedThirdLine(thirdLineText.slice(0, thirdLineIndex));

              if (thirdLineIndex >= thirdLineText.length) {
                clearInterval(thirdLineInterval);

                if (!fourthLineText) {
                  return;
                }

                const fourthLineInterval = setInterval(() => {
                  fourthLineIndex += 1;
                  setTypedFourthLine(
                    fourthLineText.slice(0, fourthLineIndex),
                  );

                  if (fourthLineIndex >= fourthLineText.length) {
                    clearInterval(fourthLineInterval);
                  }
                }, 25);

                cleanupFourthLine = () => clearInterval(fourthLineInterval);
              }
            }, 25);

            cleanupThirdLine = () => clearInterval(thirdLineInterval);
          }
        }, 25);

        cleanupSubheading = () => clearInterval(subheadingInterval);
      }
    }, 25);

    return () => {
      clearInterval(greetingInterval);
      cleanupSubheading();
      cleanupThirdLine();
      cleanupFourthLine();
    };
  }, [fourthLineText, greetingText, subheadingText, thirdLineText]);

  const handleCardClick = (card) => {
    const params = new URLSearchParams(location.search);

    if (!isLoggedIn && gatedRecommendationTitles.has(card.title)) {
      navigate(`/ai-login${location.search}`);
      return;
    }

    navigate(
      {
        pathname: card.path,
        search: params.toString() ? `?${params.toString()}` : "",
      },
      {
        state:
          card.path === "/search/results"
            ? { selectedGoal: card.title }
            : undefined,
      },
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-100px)] flex-col bg-white">
      <main className="flex-1 px-3 py-10 sm:px-6 lg:px-14">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-medium text-black/90 font-play">
            {typedGreeting}
          </h1>
          <h2 className="mt-10 text-sm font-semibold text-black/85 font-play sm:text-lg">
            {typedSubheading}
          </h2>
          {!isLoggedIn ? (
            <>
              <p className="mt-3 text-sm sm:text-lg font-semibold text-black/85 font-play">
                {typedThirdLine}
              </p>
              <p className="mt-3 text-sm sm:text-lg font-semibold text-black/85 font-play">
                {typedFourthLine}
              </p>
            </>
          ) : null}

          <div className="mt-4 rounded-[40px] px-0 py-4 md:px-6 md:py-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-10 xl:grid-cols-3">
              {recommendationCards.map((card) => {
                const Icon = card.icon;

                const isFreeCard = freeRecommendationTitles.has(card.title);
                const loggedOutCardText = isFreeCard
                  ? "Login not required"
                  : "Login required";

                return (
                  <div key={card.title}>
                    <article
                      onClick={() => handleCardClick(card)}
                      className="group cursor-pointer rounded-2xl bg-[#f1f1f3] px-3 py-5 text-center transition-colors duration-200 hover:bg-[#e8e8ed] md:rounded-none md:bg-transparent md:px-0 md:py-0 md:hover:bg-transparent"
                    >
                      <Icon
                        size={24}
                        className="mx-auto text-black/80 transition-colors duration-200 group-hover:text-sky-500"
                      />
                      <h3 className="mt-2 text-nano sm:text-nano md:text-md lg:text-md font-bold text-black/90 leading-tight transition-colors duration-200 group-hover:text-sky-500 uppercase">
                        {card.title}
                      </h3>
                      <div className="mt-2 hidden rounded-2xl bg-[#f1f1f3] p-5 text-left shadow-[0_1px_0_rgba(255,255,255,0.7)] transition-colors duration-200 group-hover:bg-sky-500 md:block">
                        <p className="text-micro leading-relaxed text-black/90 transition-colors duration-200 group-hover:text-white">
                          {card.description}
                        </p>
                      </div>
                    </article>
                    {!isLoggedIn ? (
                      <p
                        className={`mt-2 text-[10px] font-semibold tracking-wide md:text-xs ${
                          isFreeCard ? "text-primary-blue" : "text-black/70"
                        }`}
                      >
                        {loggedOutCardText}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 z-10  bg-white/95 py-6 text-center text-nano text-gray-600 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        WoNo AI can make mistakes. Check important info. See Cookie Preferences.
      </div>
    </div>
  );
};

export default AiHome;
