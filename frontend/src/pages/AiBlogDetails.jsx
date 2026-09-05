import React, { useCallback, useEffect, useRef, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useLocation } from "react-router-dom";
import humanDate from "../utils/humanDate";

const AI_CONTENT_DETAIL_GUIDE_SEEN_KEY_PREFIX =
  "wono-ai-content-detail-guide-seen";
const ARE_GUIDES_TEMPORARILY_DISABLED = false;
const CONTENT_DISCLAIMER_TOUR_SELECTOR =
  '[data-tour="content-disclaimer-section"]';

const AiBlogDetails = () => {
  // const newsContent = [
  //   {
  //     id: 1,
  //     title: "Content Title 1",
  //     image: "https://wallpapercave.com/wp/w8Lgiy5.jpg",
  //     content:
  //       "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnisdolorum reprehenderit natus quo facilis ea facere iste illum fugiattenetur, mollitia assumenda pariatur sunt voluptatem itaque quisdolore voluptas! Minima molestias tenetur modi tempore velit laborumaccusantium cupiditate nemo culpa nesciunt ex enim eligendiobcaecati ducimus, harum alias provident atque dolore perferendisquam deserunt deleniti maiores optio! Accusamus omnis libero cumquerem autem voluptates. Quas, cum eos. Dolores, tempore sit?",
  //   },
  //   {
  //     id: 2,
  //     title: "Content Title 2",
  //     image: "https://wallpapercave.com/wp/w8Lgiy5.jpg",
  //     content:
  //       "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnisdolorum reprehenderit natus quo facilis ea facere iste illum fugiattenetur, mollitia assumenda pariatur sunt voluptatem itaque quisdolore voluptas! Minima molestias tenetur modi tempore velit laborumaccusantium cupiditate nemo culpa nesciunt ex enim eligendiobcaecati ducimus, harum alias provident atque dolore perferendisquam deserunt deleniti maiores optio! Accusamus omnis libero cumquerem autem voluptates. Quas, cum eos. Dolores, tempore sit?",
  //   },
  //   {
  //     id: 3,
  //     title: "Content Title 3",
  //     image: "https://wallpapercave.com/wp/w8Lgiy5.jpg",
  //     content:
  //       "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnisdolorum reprehenderit natus quo facilis ea facere iste illum fugiattenetur, mollitia assumenda pariatur sunt voluptatem itaque quisdolore voluptas! Minima molestias tenetur modi tempore velit laborumaccusantium cupiditate nemo culpa nesciunt ex enim eligendiobcaecati ducimus, harum alias provident atque dolore perferendisquam deserunt deleniti maiores optio! Accusamus omnis libero cumquerem autem voluptates. Quas, cum eos. Dolores, tempore sit?",
  //   },
  //   {
  //     id: 4,
  //     title: "Content Title 4",
  //     image: "https://wallpapercave.com/wp/w8Lgiy5.jpg",
  //     content:
  //       "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnisdolorum reprehenderit natus quo facilis ea facere iste illum fugiattenetur, mollitia assumenda pariatur sunt voluptatem itaque quisdolore voluptas! Minima molestias tenetur modi tempore velit laborumaccusantium cupiditate nemo culpa nesciunt ex enim eligendiobcaecati ducimus, harum alias provident atque dolore perferendisquam deserunt deleniti maiores optio! Accusamus omnis libero cumquerem autem voluptates. Quas, cum eos. Dolores, tempore sit?",
  //   },
  // ];
  const location = useLocation();
  const { content } = location.state || {};
  console.log("content : ", content);
  const newsContent = content?.sections || [];
  const contentType = location.pathname.includes("/news/") ? "news" : "blog";
  const contentDetailGuideSeenKey = `${AI_CONTENT_DETAIL_GUIDE_SEEN_KEY_PREFIX}-${contentType}`;
  const hasAutoStartedContentDetailGuideRef = useRef(false);

  const [activeImage, setActiveImage] = useState(null);

  const handleImageOpen = (imageUrl) => {
    if (imageUrl) {
      setActiveImage(imageUrl);
    }
  };

  const handleImageClose = () => {
    setActiveImage(null);
  };

  const renderContent = (text) => <p className="whitespace-pre-line">{text}</p>;

  const goToHostsContentCopyright = () => {
    if (window.location.hostname.includes("localhost")) {
      window.location.href = "http://host.localhost:5173/content-and-copyright";
    } else {
      window.location.href = "https://host.wono.co/content-and-copyright";
    }
  };

  const startContentDetailGuide = useCallback(() => {
    if (typeof window === "undefined" || ARE_GUIDES_TEMPORARILY_DISABLED) {
      return;
    }

    const getVisibleElement = (selector) =>
      Array.from(document.querySelectorAll(selector)).find(
        (element) =>
          element.getClientRects().length > 0 &&
          window.getComputedStyle(element).visibility !== "hidden",
      );

    const guideSteps = [
      {
        selector: '[data-tour="content-breadcrumb"]',
        popover: {
          title: "Breadcrumb navigation",
          description:
            "Use this path to jump back to the selected region, destination, or content category.",
          side: "bottom",
          align: "start",
        },
      },
      {
        selector: '[data-tour="content-meta-section"]',
        popover: {
          title: contentType === "news" ? "News details" : "Blog details",
          description:
            contentType === "news"
              ? "This section shows the publisher, date, and original source for the news item."
              : "This section shows the author, date, and source for the blog post.",
          side: "top",
          align: "center",
        },
      },
      // Disclaimer guide hidden for now. Uncomment when needed again.
      // {
      //   selector: CONTENT_DISCLAIMER_TOUR_SELECTOR,
      //   popover: {
      //     title: "Content disclaimer",
      //     description:
      //       "This explains how WONO uses public information and links to the full content and copyright policy.",
      //     side: "top",
      //     align: "center",
      //   },
      // },
    ]
      .map(({ selector, popover }) => ({
        element: getVisibleElement(selector),
        popover,
      }))
      .filter((step) => step.element);

    if (!guideSteps.length) {
      return;
    }

    const guide = driver({
      showProgress: true,
      allowClose: true,
      animate: true,
      overlayOpacity: 0.55,
      popoverClass: "wono-driver-popover",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      steps: guideSteps,
      onDestroyed: () => {
        window.localStorage.setItem(contentDetailGuideSeenKey, "1");
      },
    });

    guide.drive();
  }, [contentDetailGuideSeenKey, contentType]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      ARE_GUIDES_TEMPORARILY_DISABLED ||
      !content ||
      hasAutoStartedContentDetailGuideRef.current ||
      window.localStorage.getItem(contentDetailGuideSeenKey) === "1"
    ) {
      return undefined;
    }

    hasAutoStartedContentDetailGuideRef.current = true;

    const guideDelay = window.setTimeout(() => {
      startContentDetailGuide();
    }, 700);

    return () => {
      window.clearTimeout(guideDelay);
    };
  }, [content, contentDetailGuideSeenKey, startContentDetailGuide]);

  return (
    <div className="min-w-[70%] max-w-[80rem] lg:max-w-[75rem] mx-0 md:mx-auto p-4 lg:p-0">
      {/* <button
        type="button"
        onClick={handleBackButtonClick}
        aria-label="Go back"
        className="inline-flex items-center justify-center rounded-full border border-primary-blue p-1 text-primary-blue"
      >
        <ArrowLeft size={16} />
      </button> */}
      <div className="flex flex-col gap-8">
        <section className="space-y-8">
          <h1 className="text-title leading-normal font-bold">
            {content?.mainTitle ||
              content?.title ||
              "Lorem ipsum dolor sit amet consectetur adipisicing elit."}
          </h1>
          <div className="h-96 rounded-xl w-full overflow-hidden">
            <img
              src={
                content?.mainImage ||
                content?.image ||
                "https://wallpapercave.com/wp/w8Lgiy5.jpg"
              }
              alt="main-image"
              className="object-contain h-full w-full cursor-pointer"
              onClick={() =>
                handleImageOpen(
                  content?.mainImage ||
                    content?.image ||
                    "https://wallpapercave.com/wp/w8Lgiy5.jpg",
                )
              }
            />
          </div>
          {renderContent(
            content?.mainContent ||
              content?.content ||
              "Main Content goes here",
          )}
        </section>
        <hr />
        <section className="flex flex-col gap-8">
          {newsContent &&
            newsContent.map((item) => (
              <article key={item.id} className="space-y-4">
                <h1 className="text-card-title font-bold leading-[1.2] md:leading-[1.35] lg:leading-[1rem]">
                  {item.title}
                </h1>
                {item.image && (
                  <div className="h-96 rounded-xl w-full overflow-hidden">
                    <img
                      src={item.image}
                      alt="main-image"
                      className="object-contain h-full w-full cursor-pointer"
                      onClick={() => handleImageOpen(item.image)}
                    />
                  </div>
                )}
                {renderContent(item.content)}
              </article>
            ))}
        </section>
        <hr />
        <footer
          data-tour="content-meta-section"
          className="flex w-full flex-col items-center gap-2 text-center text-sm md:flex-row md:items-center md:justify-between md:gap-4 md:text-left md:text-base"
        >
          <p className="w-full break-words md:w-auto">
            {content?.author || ""}
          </p>
          <p className="w-full break-words md:w-auto">
            {humanDate(content?.date) || new Date().toLocaleString()}
          </p>
          <p className="w-full break-words md:w-auto md:text-right">
            {typeof content?.source === "object"
              ? content?.source?.name || "Source"
              : content?.source || "Source"}
          </p>
        </footer>
      </div>
      <hr className="mt-5 mb-0 lg:mt-10 lg:mb-0" />

      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
          onClick={handleImageClose}
        >
          <div
            className="relative max-h-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -right-3 -top-3 rounded-full bg-white px-2 py-1 text-sm font-semibold text-gray-700 shadow"
              onClick={handleImageClose}
              aria-label="Close image preview"
            >
              ✕
            </button>
            <img
              src={activeImage}
              alt="Expanded content"
              className="max-h-[85vh] w-full rounded-lg object-contain shadow-xl"
            />
          </div>
        </div>
      )}

      {/* Content & Source Disclaimer */}
      <div
        data-tour="content-disclaimer-section"
        className="text-[0.5rem] text-gray-500 leading-relaxed mt-5"
      >
        <p className="mb-2">
          <b>Source:</b> All above content, images and details have been sourced
          from publicly available information.
        </p>
        <p className="mb-2">
          <b>Content and Copyright Disclaimer:</b> WoNo is a nomad services and
          informational platform that aggregates and presents publicly available
          information about co-working spaces, co-living spaces, serviced
          apartments, hostels, workation spaces, meeting rooms, working cafés
          and related lifestyle or travel services. All such information
          displayed on its platform, including images, brand names, or
          descriptions is shared solely for informational and reference purposes
          to help nomads/users discover and compare global nomad-friendly
          information and services on its central platform.
        </p>
        <p className="mb-2">
          WoNo does not claim ownership of any third-party logos, images,
          descriptions, or business information displayed on the platform. All
          trademarks, brand names, and intellectual property remain the
          exclusive property of their respective owners and platforms. The
          inclusion of third-party information does not imply endorsement,
          partnership, or affiliation unless explicitly stated.
        </p>
        <p className="mb-2">
          The content featured from other websites and platforms on WoNo is not
          used for direct monetization, resale, or advertising gain. WoNo’s
          purpose is to inform and connect digital nomads and remote working
          professionals by curating publicly available data in a transparent,
          good-faith manner for the ease of its users and to support and grow
          the businesses who are providing these services with intent to grow
          them and the ecosystem.
        </p>
        <p className="mt-2">
          Read the entire{" "}
          <span
            className="underline text-primary-blue cursor-pointer"
            onClick={goToHostsContentCopyright}
          >
            Content and Copyright
          </span>{" "}
          by clicking the link in our website footer.
        </p>
      </div>
    </div>
  );
};

export default AiBlogDetails;
