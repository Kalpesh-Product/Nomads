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
        title: "BASIC",
        subtitle: "Everything you need to start, manage, and grow your business at no cost!",
        price: "FREE*",
        ctaText: "Get Started",
        highlight: false,
        note: "* Limited time offer for few months.",
        features: [
            "Static Website (Desktop & Mobile)",
            "Admin Control Panel",
            "Automated Lead Capture",
            "Smart Lead Management",
            "Visitor Tracking System",
            "Built-in AI Chat",
            "Cloud Storage",
            "Dedicated Support",
            "Up to 2 Users",
        ],
        path: "/host/ai-host-signup",
    },
    {
        title: "PROFESSIONAL",
        subtitle: "Your ambitions and goals to scale from a small business to a GROWING COMPANY!",
        price: "$199",
        priceSuffix: "/month",
        ctaText: "Get Started",
        highlight: true,
        note: "Free activation and free for first month.",
        features: [
            "Everything in BASIC +",
            "Transactional Website",
            "Payment Gateway",
            "Advanced Sales Module",
            "Meeting Room Booking System",
            "Visitor Management",
            "Integrated Ticketing System",
            "Smart Calendar",
            "Up to 5 Users",
        ],
        path: "/host/ai-host-signup",
    },
    {
        title: "CUSTOMISE",
        subtitle: "Tailored solutions for companies scaling into ENTERPRISE LEVEL OPERATIONS!",
        price: "PERSONALISED",
        ctaText: "Get Started",
        highlight: false,
        note: "Custom activation post testing.",
        features: [
            "Everything in PROFESSIONAL +",
            "Advanced Booking Engine",
            "Custom Native Applications",
            "End-to-End Finance Suite",
            "HR Management System (HRMS)",
            "IT Infrastructure Module",
            "Maintenance Management Module",
            "AI-Driven Lead Generation",
            "AI Customer Experience Agent",
            "AI Sales Automation",
            "AI SEO & Growth Engine",
            "Custom-Built Technology Stack",
            "Unlimited Users",
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

                                <p className="mt-2 mb-10 text-sm sm:text-lg font-medium text-primary-blue font-play">
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
                                    : "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
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
                                                    ? "border-primary-blue -translate-y-2 shadow-[0_16px_32px_rgba(15,23,48,0.12)] ring-2 ring-primary-blue/18"
                                                    : card.highlight
                                                        ? "border-primary-blue -translate-y-2 shadow-[0_18px_36px_rgba(37,99,235,0.14)] ring-2 ring-primary-blue/16"
                                                        : "border-transparent shadow-[0_8px_18px_rgba(15,23,48,0.06)] hover:border-primary-blue hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(15,23,48,0.10)]"
                                                    }`}
                                            >
                                                {card.badgeText && (
                                                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-blue px-5 py-1 text-[11px] font-bold tracking-[0.18em] text-white">
                                                        {card.badgeText}
                                                    </span>
                                                )}

                                                {(card.highlight || selectedPlanTitle === card.title) && (
                                                    <span className="pointer-events-none absolute inset-x-10 -bottom-2 h-5 rounded-full bg-primary-blue/12 blur-lg" />
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
                                                    {card.features.map((feature) => {
                                                        const highlightedFeature = feature.replace(
                                                            /\b(BASIC|PROFESSIONAL|CUSTOMISE|Basic|Professional|Customise|)\b/g,
                                                            "<strong class=\"font-bold text-black\">$1</strong>",
                                                        );

                                                        return (
                                                            <li key={feature} className="flex items-center gap-3 text-[#5a6d89]">
                                                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#dff5ea] text-[#16b26a]">
                                                                    <FaCheck size={10} />
                                                                </span>
                                                                <span
                                                                    className="text-xs"
                                                                    dangerouslySetInnerHTML={{ __html: highlightedFeature }}
                                                                />
                                                            </li>
                                                        );
                                                    })}
                                                </ul>

                                                <div className="mt-7">
                                                    {card.note && (
                                                        <p className="mb-2 text-center text-[10px] text-[#9ca3af]">
                                                            <hr className="border-[#dfe5ef] mb-2 w-full" />
                                                            {card.note}
                                                        </p>
                                                    )}
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
