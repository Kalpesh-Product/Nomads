import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineHeart,
  HiOutlineUserCircle,
} from "react-icons/hi";
import { LuCircleDollarSign, LuMapPinned } from "react-icons/lu";
import useNomadLoginState from "../hooks/useNomadLoginState";

const gatedRecommendationTitles = new Set([
  "Work From Anywhere",
  "Increase Your Savings",
  "Advance Your Career",
  "Find Your Community",
]);

const recommendationCards = [
  {
    title: "World Ranking",
    description:
      "WoNo analyzes global data to rank the best destinations worldwide based on livability, popularity, and remote-work potential.",
    icon: HiOutlineViewGrid,
    path: "/search/results",
  },
  {
    title: "Work From Anywhere",
    description:
      "WoNo evaluates your preferences and recommends destinations that best match your lifestyle and work needs.",
    icon: HiOutlineHeart,
    path: "/search/results",
  },
  {
    title: "Increase Your Savings",
    description:
      "WoNo calculates where your income goes further and highlights destinations that help you save more while living well.",
    icon: LuCircleDollarSign,
    path: "/search/results",
  },
  {
    title: "Advance Your Career",
    description:
      "WoNo identifies high-value, low-cost destinations that offer strong amenities without high expenses.",
    icon: LuMapPinned,
    path: "/search/results",
  },
  {
    title: "Find Your Community",
    description:
      "WoNo matches destinations to your climate, culture, and community preferences for a better overall fit.",
    icon: HiOutlineUserCircle,
    path: "/search/results",
  },
  {
    title: "Search Old School",
    description:
      "WoNo lets you manually filter and sort destinations if you prefer a traditional search approach.",
    icon: HiOutlineViewGrid,
    path: "/",
  },
];

const AiHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [typedGreeting, setTypedGreeting] = useState("");
  const [typedSubheading, setTypedSubheading] = useState("");

  const [typedLoggedOutNote, setTypedLoggedOutNote] = useState("");

  const isLoggedIn = useNomadLoginState();

  const greetingText = isLoggedIn ? "hi Abrar" : "Meet Wono";
  const subheadingText = isLoggedIn
    ? "Please choose your goals from below so that we can help you design your accurate nomad lifestyle."
    : "AI-Powered Living For The Modern Nomad";
  const loggedOutNoteText = isLoggedIn
    ? ""
    : "World ranking and search old school are available without logging in. Log in to view the rest.";

  useEffect(() => {
    setTypedGreeting("");
    setTypedSubheading("");
    setTypedLoggedOutNote("");

    let greetingIndex = 0;
    let subheadingIndex = 0;
    let loggedOutNoteIndex = 0;
    let cleanupSubheading = () => {};
    let cleanupLoggedOutNote = () => {};

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

            if (!loggedOutNoteText) {
              return;
            }

            const loggedOutNoteInterval = setInterval(() => {
              loggedOutNoteIndex += 1;
              setTypedLoggedOutNote(
                loggedOutNoteText.slice(0, loggedOutNoteIndex),
              );

              if (loggedOutNoteIndex >= loggedOutNoteText.length) {
                clearInterval(loggedOutNoteInterval);
              }
            }, 25);

            cleanupLoggedOutNote = () => clearInterval(loggedOutNoteInterval);
          }
        }, 25);

        cleanupSubheading = () => clearInterval(subheadingInterval);
      }
    }, 25);

    return () => {
      clearInterval(greetingInterval);
      cleanupSubheading();
      cleanupLoggedOutNote();
    };
  }, [greetingText, loggedOutNoteText, subheadingText]);

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
      <main className="flex-1 px-6 py-10 lg:px-14">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-medium text-black/90 font-play">
            {typedGreeting}
          </h1>
          <h2 className="mt-10 text-lg font-semibold text-black/85 font-play">
            {typedSubheading}
          </h2>
          {!isLoggedIn ? (
            <p className="mt-3 text-lg font-semibold text-black/85 font-play">
              {typedLoggedOutNote}
            </p>
          ) : null}

          <div className="mt-16 rounded-[40px] px-6 py-8">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
              {recommendationCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.title}
                    onClick={() => handleCardClick(card)}
                    className="group cursor-pointer text-center"
                  >
                    <Icon
                      size={24}
                      className="mx-auto text-black/80 transition-colors duration-200 group-hover:text-sky-500"
                    />
                    <h3 className="mt-2 text-md font-bold text-black/90 leading-tight transition-colors duration-200 group-hover:text-sky-500">
                      {card.title}
                    </h3>
                    <div className="mt-2 rounded-2xl bg-[#f1f1f3] p-5 text-left shadow-[0_1px_0_rgba(255,255,255,0.7)] transition-colors duration-200 group-hover:bg-sky-500">
                      <p className="text-nano leading-relaxed text-black/90 transition-colors duration-200 group-hover:text-white">
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

      <div className="sticky bottom-0 z-10  bg-white/95 py-6 text-center text-nano text-gray-600 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        WoNo AI can make mistakes. Check important info. See Cookie Preferences.
      </div>
    </div>
  );
};

export default AiHome;
