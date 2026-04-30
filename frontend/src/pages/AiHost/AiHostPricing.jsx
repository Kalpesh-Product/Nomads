import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaGlobeAmericas } from "react-icons/fa";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { TbAward } from "react-icons/tb";
import useNomadLoginState from "../../hooks/useNomadLoginState";

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
        title: "Free Plan",
        description: "Up to 10 users",
        description1: "Basic analytics ",
        description2: "Task management ",
        description3: "Email support ",
        description4: "5 GB storage ",
        description5: "Mobile app access",
        footerText: "Free",
        icon: TbAward,
        path: getSearchPathForGoal("World Ranking"),
    },
    {
        title: "Plus",
        description: "Up to 50 users",
        description1: "Advanced analytics",
        description2: "Automation workflows",
        description3: "Priority support",
        description4: "50 GB storage",
        description5: "API access",
        description6: "Custom integrations",
        description7: "Advanced reporting",
        footerText: "$99/month",
        icon: FaGlobeAmericas,
        path: getSearchPathForGoal("Work From Anywhere"),
    },
    {
        title: "Pro",
        description: "Unlimited users",
        description1: "Enterprise analytics",
        description2: "Custom workflows",
        description3: "24/7 dedicated support",
        description4: "Unlimited storage",
        description5: "Custom integrations",
        description6: "SLA guarantee",
        description7: "Dedicated account manager",
        footerText: "$199/month",
        icon: HiOutlineCurrencyDollar,
        path: getSearchPathForGoal("Increase Your Savings"),
    },
    // {
    //     title: "Ultra",
    //     description: "Unlimited users",
    //     description1: "Enterprise analytics",
    //     description2: "Custom workflows",
    //     description3: "24/7 dedicated support",
    //     description4: "Unlimited storage",
    //     description5: "Custom integrations",
    //     description6: "SLA guarantee",
    //     description7: "Dedicated account manager",
    //     footerText: "$299/month",
    //     icon: HiOutlineCurrencyDollar,
    //     path: getSearchPathForGoal("Increase Your Savings"),
    // },
    // {
    //     title: "Enterprise",
    //     description: "Unlimited users",
    //     description1: "Enterprise analytics",
    //     description2: "Custom workflows",
    //     description3: "24/7 dedicated support",
    //     description4: "Unlimited storage",
    //     description5: "Custom integrations",
    //     description6: "SLA guarantee",
    //     description7: "Dedicated account manager",
    //     footerText: "Custom",
    //     icon: HiOutlineCurrencyDollar,
    //     path: getSearchPathForGoal("Increase Your Savings"),
    // },
];

const gatedRecommendationTitles = new Set([
    "World Ranking",
    "Work From Anywhere",
    "Increase Your Savings",
    "Advance Your Career",
    "Find Your Community",
]);

const AiHostPricing = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = useNomadLoginState();

    const [typedGreeting, setTypedGreeting] = useState("");
    const [typedSubheading, setTypedSubheading] = useState("");
    const [typedFourthLine, setTypedFourthLine] = useState("");
    const [areCardsVisible, setAreCardsVisible] = useState(false);
    const [visibleCardCount, setVisibleCardCount] = useState(0);

    const greetingText = isLoggedIn ? "Hi Abrar" : "Meet Wono";
    const subheadingText = isLoggedIn
        ? "Welcome back to Wono, an intelligent platform for modern nomads."
        : "An intelligent platform for modern nomads … Early adoption of our future lifestyle!";

    const fourthLineText = "Choose your goals from below so that we can help you design your nomad lifestyle.";

    // Typing Effect
    useEffect(() => {
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
    }, [greetingText, subheadingText, fourthLineText]);

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

    const handleCardClick = (card) => {
        const params = new URLSearchParams(location.search);
        const queryString = params.toString() ? `?${params.toString()}` : "";

        const targetPath = `${card.path}${queryString}`;

        // If not logged in and this is a gated feature
        if (!isLoggedIn && gatedRecommendationTitles.has(card.title)) {
            const goalSlug = goalSlugByTitle[card.title];
            const loginPath = goalSlug ? `/ai-login/${goalSlug}` : "/ai-login";

            navigate(`${loginPath}${location.search}`, {
                state: {
                    loginContext: { title: card.title, description: card.description },
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
        <div className="flex min-h-[calc(100vh-100px)] flex-col bg-white">
            <main className="flex-1 px-3 py-6 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-5xl text-center">
                    <h1 className="text-3xl font-medium text-black/90 font-play">
                        {typedGreeting}
                    </h1>

                    <h2 className="mt-5 text-sm font-semibold text-black/85 sm:text-lg font-play">
                        {typedSubheading}
                    </h2>

                    <p className="mt-6 text-sm sm:text-lg font-medium text-primary-blue font-play">
                        {typedFourthLine}
                    </p>

                    <div className={`mt-8 ${areCardsVisible ? "visible" : "invisible"}`}>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {recommendationCards.map((card, index) => {
                                const Icon = card.icon;
                                const isGated = gatedRecommendationTitles.has(card.title);

                                return (
                                    <div
                                        key={card.title}
                                        className={`transition-all duration-300 ${index < visibleCardCount
                                            ? "translate-y-0 opacity-100"
                                            : "translate-y-4 opacity-0 pointer-events-none"
                                            }`}
                                    >
                                        <article
                                            onClick={() => handleCardClick(card)}
                                            className="group cursor-pointer rounded-3xl bg-[#f1f1f3] p-6 text-center transition-all hover:bg-[#e8e8ed] active:scale-[0.985]"
                                        >
                                            <Icon
                                                size={32}
                                                className="mx-auto text-black/80 transition-colors group-hover:text-sky-600"
                                            />
                                            <h3 className="mt-4 text-lg font-bold text-black/90 transition-colors group-hover:text-sky-600">
                                                {card.title}
                                            </h3>

                                            <p className="mt-3 text-sm leading-relaxed text-black/70">
                                                {card.description}
                                            </p>

                                            <p className="mt-3 text-sm leading-relaxed text-black/70">
                                                {card.description1}
                                            </p>
                                            <p className="mt-3 text-sm leading-relaxed text-black/70">
                                                {card.description2}
                                            </p>
                                            <p className="mt-3 text-sm leading-relaxed text-black/70">
                                                {card.description3}
                                            </p>
                                            <p className="mt-3 text-sm leading-relaxed text-black/70">
                                                {card.description4}
                                            </p>
                                            <p className="mt-3 text-sm leading-relaxed text-black/70">
                                                {card.description5}
                                            </p>
                                            <p className="mt-3 text-sm leading-relaxed text-black/70">
                                                {card.description6}
                                            </p>
                                            <p className="mt-3 text-sm leading-relaxed text-black/70">
                                                {card.description7}
                                            </p>

                                            <div className="mt-6 pt-4 border-t border-black/10">
                                                <p className="text-sm font-semibold text-black/80">
                                                    {card.footerText}
                                                </p>
                                            </div>
                                        </article>

                                        {!isLoggedIn && (
                                            <p className="mt-2 text-xs font-medium text-black/60">
                                                {isGated ? "No login required" : "Login required"}
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
    );
};

export default AiHostPricing;