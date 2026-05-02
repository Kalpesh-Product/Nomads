import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaGlobeAmericas } from "react-icons/fa";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { TbAward } from "react-icons/tb";
import useNomadLoginState from "../../hooks/useNomadLoginState";
import { FaCheck } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const AI_HOME_TYPING_SEEN_KEY = "wono-ai-home-typing-seen";

const goalSlugByTitle = {
    "World Ranking": "worldranking",
    "Work From Anywhere": "workfromanywhere",
    "Increase Your Savings": "increaseyoursavings",
    "Advance Your Career": "advanceyourcareer",
    "Find Your Community": "findyourcommunity",
};

const getSearchPathForGoal = (goalTitle) => {
    const goalSlug = goalSlugByTitle[goalTitle];
    return goalSlug ? `/search/${goalSlug}/results` : "/search/results";
};

const recommendationCards = [
    {
        title: "STARTER",
        subtitle: "A clean starting plan for smaller teams building better daily operations.",
        price: "Free",
        // priceSuffix: "/month",
        ctaText: "Get Started",
        highlight: false,
        features: [
            "Up to 10 users",
            "Basic analytics",
            "Task management",
            "Email support",
            "5 GB storage",
            "Mobile app access",
        ],
        path: "/host/ai-host-signup",
    },
    {
        title: "PLUS",
        subtitle: "A stronger operating layer for growing teams that need more control and automation.",
        price: "$99",
        priceSuffix: "/month",
        ctaText: "Get Started",
        highlight: true,
        badgeText: "MOST POPULAR",
        features: [
            "All features of STARTER plan",
            "Up to 50 users",
            "Advanced analytics",
            "Automation workflows",
            "Priority support",
            "50 GB storage",
            "API access",
            "Custom integrations",
            "Advanced reporting",
        ],
        path: "/host/ai-host-signup",
    },
    {
        title: "PROFESSIONAL",
        subtitle: "A tailored plan for larger organizations with deeper operational and security needs.",
        price: "$499",
        priceSuffix: "/month",
        ctaText: "Get Started",
        highlight: false,
        features: [
            "All features of PLUS plan",
            "Unlimited users",
            "Enterprise analytics",
            "Custom workflows",
            "24/7 dedicated support",
            "Unlimited storage",
            "Custom integrations",
            "SLA guarantee",
            "Dedicated account manager",
        ],
        path: "/host/ai-host-signup",
    },
    {
        title: "ENTERPRISE",
        subtitle: "A tailored plan for larger organizations with deeper operational and security needs.",
        price: "$499",
        priceSuffix: "/month",
        ctaText: "Get Started",
        highlight: false,
        features: [
            "All features of PROFESSIONAL plan",
            "Unlimited users",
            "Enterprise analytics",
            "Custom workflows",
            "24/7 dedicated support",
            "Unlimited storage",
            "Custom integrations",
            "SLA guarantee",
            "Dedicated account manager",
        ],
        path: "/host/ai-host-signup",
    },
];

const gatedRecommendationTitles = new Set([
    "World Ranking",
    "Work From Anywhere",
    "Increase Your Savings",
    "Advance Your Career",
    "Find Your Community",
]);

const AiHostPricing = ({ compact = false, startStep = 1, onSelectPlan }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = useNomadLoginState();

    const [typedGreeting, setTypedGreeting] = useState(compact ? "" : "");
    const [typedSubheading, setTypedSubheading] = useState(compact ? "" : "");
    const [typedFourthLine, setTypedFourthLine] = useState(compact ? "" : "");
    const [areCardsVisible, setAreCardsVisible] = useState(compact);
    const [visibleCardCount, setVisibleCardCount] = useState(
        compact ? recommendationCards.length : 0,
    );
    const [selectedPlanTitle, setSelectedPlanTitle] = useState("");
    const cardsScrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const greetingText = isLoggedIn ? "Hi Abrar" : "Meet Wono";
    const subheadingText = isLoggedIn
        ? "Welcome back to Wono, an intelligent platform for modern nomads."
        : "An intelligent platform for modern nomad businesses!";

    const fourthLineText = "Choose your goals from below so that we can become your extended team for your business.";

    // Typing Effect
    useEffect(() => {
        if (compact) {
            setAreCardsVisible(true);
            setVisibleCardCount(recommendationCards.length);
            return;
        }
        const hasSeenTyping = window.localStorage.getItem(AI_HOME_TYPING_SEEN_KEY) === "true";

        if (hasSeenTyping) {
            setTypedGreeting(greetingText);
            setTypedSubheading(subheadingText);
            setTypedFourthLine(fourthLineText);
            setAreCardsVisible(true);
            return;
        }

        let greetingIndex = 0;
        let subheadingIndex = 0;
        let fourthIndex = 0;

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

                        const fourthInterval = setInterval(() => {
                            fourthIndex += 1;
                            setTypedFourthLine(fourthLineText.slice(0, fourthIndex));

                            if (fourthIndex >= fourthLineText.length) {
                                clearInterval(fourthInterval);
                                window.localStorage.setItem(AI_HOME_TYPING_SEEN_KEY, "true");
                                setAreCardsVisible(true);
                            }
                        }, 7);
                    }
                }, 7);
            }
        }, 7);

        return () => {
            clearInterval(greetingInterval);
        };
    }, [compact, greetingText, subheadingText, fourthLineText]);

    // Card Reveal Animation
    useEffect(() => {
        if (!areCardsVisible) {
            setVisibleCardCount(0);
            return;
        }

        let count = 0;
        const interval = setInterval(() => {
            count += 1;
            setVisibleCardCount(count);
            if (count >= recommendationCards.length) {
                clearInterval(interval);
            }
        }, 120);

        return () => clearInterval(interval);
    }, [areCardsVisible]);

    useEffect(() => {
        if (recommendationCards.length <= 3) {
            setCanScrollLeft(false);
            setCanScrollRight(false);
            return;
        }

        const element = cardsScrollRef.current;
        if (!element) return;

        const updateScrollButtons = () => {
            const maxScrollLeft = element.scrollWidth - element.clientWidth;
            setCanScrollLeft(element.scrollLeft > 0);
            setCanScrollRight(element.scrollLeft < maxScrollLeft - 1);
        };

        updateScrollButtons();
        element.addEventListener("scroll", updateScrollButtons);
        window.addEventListener("resize", updateScrollButtons);

        return () => {
            element.removeEventListener("scroll", updateScrollButtons);
            window.removeEventListener("resize", updateScrollButtons);
        };
    }, [visibleCardCount]);

    const scrollCards = (direction) => {
        const element = cardsScrollRef.current;
        if (!element) return;
        const scrollAmount = Math.max(260, Math.floor(element.clientWidth * 0.8));
        element.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };


    const handleCardClick = (card) => {
        setSelectedPlanTitle(card.title);

        if (compact && typeof onSelectPlan === "function") {
            onSelectPlan(card);
            return;
        }
        const params = new URLSearchParams(location.search);
        params.delete("step");
        params.set("step", String(startStep));
        if (card.path.includes("/ai-host-signup")) {
            params.set("plan", card.title);
        }
        const queryString = params.toString();
        const targetPath = `${card.path}${queryString ? `?${queryString}` : ""}`;

        // If not logged in and this is a gated feature
        if (!isLoggedIn && gatedRecommendationTitles.has(card.title)) {
            const goalSlug = goalSlugByTitle[card.title];
            const loginPath = goalSlug ? `/ai-login/${goalSlug}` : "/ai-login";

            navigate(`${loginPath}${location.search}`, {
                state: {
                    loginContext: { title: card.title, description: card.subtitle },
                    redirectTo: targetPath,
                },
            });
            return;
        }

        navigate(targetPath, {
            state: card.path.includes("/search") ? { selectedGoal: card.title } : undefined,
        });
    };


    return (
        <>
            <div className="flex min-h-[calc(100vh-100px)] flex-col bg-white">
                <main className="flex-1 px-3 py-6 sm:px-6 lg:px-0">
                    <div className="mx-auto max-w-5xl lg:max-w-full text-center">
                        {!compact && (
                            <>
                                <h1 className="text-3xl font-medium text-black/90 font-play">
                                    {typedGreeting}
                                </h1>

                                <h2 className="mt-5 text-sm font-semibold text-black/85 sm:text-lg font-play">
                                    {typedSubheading}
                                </h2>

                                <p className="mt-6 text-sm sm:text-lg font-medium text-primary-blue font-play">
                                    {typedFourthLine}
                                </p>
                            </>
                        )}

                        <div className={`relative mt-8 ${areCardsVisible ? "visible" : "invisible"}`}>
                            {recommendationCards.length > 3 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => scrollCards("left")}
                                        disabled={!canScrollLeft}
                                        aria-label="Scroll pricing cards left"
                                        className={`absolute -left-5 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white p-3 shadow-md transition-all ${canScrollLeft
                                            ? "border-[#d9e2f0] text-[#1e2b45] hover:bg-white"
                                            : "cursor-not-allowed border-[#e7edf5] text-[#a9b4c8]"
                                            }`}
                                    >
                                        <FaChevronLeft size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => scrollCards("right")}
                                        disabled={!canScrollRight}
                                        aria-label="Scroll pricing cards right"
                                        className={`absolute -right-5 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white p-3 shadow-md transition-all ${canScrollRight
                                            ? "border-[#d9e2f0] text-[#1e2b45] hover:bg-white"
                                            : "cursor-not-allowed border-[#e7edf5] text-[#a9b4c8]"
                                            }`}
                                    >
                                        <FaChevronRight size={14} />
                                    </button>
                                </>
                            )}
                            <div
                                ref={cardsScrollRef}
                                className={`${recommendationCards.length > 3
                                    ? "flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto px-4 sm:px-6 pt-10 pb-6 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                                    : "grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3"
                                    }`}
                            >
                                {recommendationCards.map((card, index) => {
                                    const isGated = gatedRecommendationTitles.has(card.title);

                                    return (
                                        <div
                                            key={card.title}
                                            className={`transition-all duration-300 ${index < visibleCardCount
                                                ? "translate-y-0 opacity-100"
                                                : "translate-y-4 opacity-0 pointer-events-none"
                                                } ${recommendationCards.length > 3 ? "min-w-[86%] sm:min-w-[46%] lg:min-w-[31%] snap-start" : ""}`}
                                        >
                                            <article
                                                className={`relative flex h-full flex-col rounded-[34px] border bg-[#f5f7fb] p-6 text-left transition-all duration-300 sm:p-7 ${selectedPlanTitle === card.title
                                                    ? "border-primary-blue -translate-y-2 shadow-[0_28px_50px_rgba(15,23,48,0.22)] ring-2 ring-primary-blue/25"
                                                    : card.highlight
                                                        ? "border-primary-blue -translate-y-3 shadow-[0_32px_60px_rgba(37,99,235,0.28)] ring-2 ring-primary-blue/20"
                                                        : "border-transparent shadow-[0_10px_20px_rgba(15,23,48,0.08)] hover:border-primary-blue hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(15,23,48,0.16)]"
                                                    }`}
                                            >
                                                {card.badgeText && (
                                                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-primary-blue px-4 py-1 text-[10px] font-bold tracking-[0.12em] text-white sm:px-5 sm:text-[11px] sm:tracking-[0.18em]">
                                                        {card.badgeText}
                                                    </span>
                                                )}

                                                {(card.highlight || selectedPlanTitle === card.title) && (
                                                    <span className="pointer-events-none absolute inset-x-8 -bottom-3 h-6 rounded-full bg-primary-blue/25 blur-xl" />
                                                )}

                                                <h3 className="mt-2 text-center text-2xl font-bold text-[#121a33]">
                                                    {card.title}
                                                </h3>

                                                <p className="mx-auto mt-3 max-w-[360px] text-center text-[11px] leading-relaxed text-[#5a6d89]">
                                                    {card.subtitle}
                                                </p>

                                                <div className="mt-6 flex items-baseline justify-center gap-2">
                                                    <span className="text-2xl font-extrabold text-[#0f1730]">{card.price}</span>
                                                    {card.priceSuffix && (
                                                        <span className="text-lg font-semibold text-[#60708b]">{card.priceSuffix}</span>
                                                    )}
                                                </div>

                                                <div className="mt-5 border-t border-[#dfe5ef] pt-6" />

                                                <ul className="flex flex-1 flex-col gap-3">
                                                    {card.features.map((feature) => (
                                                        <li key={feature} className="flex items-center gap-3 text-[#5a6d89]">
                                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#dff5ea] text-[#16b26a]">
                                                                <FaCheck size={10} />
                                                            </span>
                                                            <span className={`text-[12.5px] ${[
                                                                "All features of STARTER plan",
                                                                "All features of PLUS plan",
                                                                "All features of PROFESSIONAL plan",
                                                            ].includes(feature)
                                                                ? "font-bold text-black"
                                                                : ""}`}>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <div className="mt-7">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCardClick(card)}
                                                        className={`w-full rounded-full px-4 py-3 text-base font-medium transition-colors ${card.highlight
                                                            ? "bg-primary-blue text-white"
                                                            : "bg-[#e6ebf2] text-[#1e2b45]"
                                                            }`}
                                                    >
                                                        {compact ? "Select" : card.ctaText}
                                                    </button>
                                                </div>
                                            </article>

                                            {!isLoggedIn && (
                                                <p className="mt-2 text-xs font-medium text-black/60">
                                                    {/* {isGated ? "No login required" : "Login required"} */}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default AiHostPricing;