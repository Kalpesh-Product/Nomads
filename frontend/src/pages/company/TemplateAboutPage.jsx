import React from "react";
import { useOutletContext } from "react-router-dom";
import Container from "../../components/Container";
import { getMediaUrl } from "./utils/pageTemplateUtils";

const getMediaSrc = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return getMediaSrc(value[0]);
  if (typeof value === "object") {
    return value?.url || value?.preview || value?.location || "";
  }
  return "";
};

const TemplateAboutPage = () => {
  const { data, isPending, error } = useOutletContext();

  if (isPending) return null;
  if (error) return <div>Error loading about page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const teamCards = Array.isArray(data?.aboutPageImageCards)
    ? data.aboutPageImageCards
    : [];
  const aboutParagraphs = Array.isArray(data?.about) ? data.about : [];

  // Narrative blocks for Story, Mission, Vision, Values
  const aboutNarrativeBlocks = [
    {
      title: data?.aboutPageStoryHeading || "Our Story",
      body: String(data?.aboutPageStory || "").trim(),
    },
    {
      title: data?.aboutPageMissionHeading || "Our Mission",
      body: String(data?.aboutPageMission || "").trim(),
    },
    {
      title: data?.aboutPageVisionHeading || "Our Vision",
      body: String(data?.aboutPageVision || "").trim(),
    },
    {
      title: data?.aboutPageValuesHeading || "Our Values",
      body: String(data?.aboutPageValues || "").trim(),
    },
  ].filter((item) => item.body);

  // Founders
  const founders = Array.isArray(data?.founders)
    ? data.founders.filter((f) => String(f?.name || "").trim())
    : [];

  const aboutIntroText =
    String(data?.aboutPageIntro || "").trim() ||
    String(data?.aboutPageOverview || "").trim() ||
    (aboutParagraphs.length > 0 ? aboutParagraphs[0] : "");

  return (
    <section className="bg-black px-4 py-12 text-white md:px-6 md:py-15">
      <div className="mx-auto w-full max-w-7xl text-center">
        <h2 className="text-[24px] font-semibold text-[#f7e53f] font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[32px]">
          About Our Vision
        </h2>
        <div className="mx-auto mt-8 max-w-5xl space-y-4 text-center text-white">
          {aboutParagraphs.length ? (
            aboutParagraphs.map((item, idx) => (
              <p
                key={`about-page-${idx}`}
                className="font-['Poppins',ui-sans-serif,system-ui,sans-serif] text-[15px] leading-[1.55] md:text-[20px] md:leading-[1.4]"
              >
                {item}
              </p>
            ))
          ) : aboutIntroText ? (
            <p className="font-['Poppins',ui-sans-serif,system-ui,sans-serif] text-[15px] leading-[1.55] md:text-[20px] md:leading-[1.4]">
              {aboutIntroText}
            </p>
          ) : null}
        </div>

        {/* Narrative Blocks: Story, Mission, Vision, Values */}
        {aboutNarrativeBlocks.length ? (
          <div className="mt-10 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-2">
            {aboutNarrativeBlocks.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left md:p-6"
              >
                <h3 className="text-[20px] font-semibold text-[#f7e53f] md:text-[24px]">
                  {item.title}
                </h3>
                <p className="mt-3 font-['Poppins',ui-sans-serif,system-ui,sans-serif] text-[14px] leading-[1.6] text-white/90 md:text-[17px]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        ) : null}

        {/* Founders Section */}
        {founders.length ? (
          <div className="mt-14 space-y-16">
            <h3 className="text-center text-[22px] font-semibold text-[#f7e53f] md:text-[28px]">
              Our Founders
            </h3>
            {founders.map((founder, idx) => {
              const founderImg =
                typeof founder?.image === "string"
                  ? founder.image
                  : getMediaSrc(founder?.image) || "";
              
              // Parse highlights - DB stores as array with one string containing \n characters
              // Example: ["20 Years Experience\n15 Years in Startups\n10 Years as Founder"]
              let founderHighlights = [];
              
              if (Array.isArray(founder?.highlights) && founder.highlights.length > 0) {
                // Take the first element (which contains all highlights separated by \n)
                const highlightsString = String(founder.highlights[0] || "");
                founderHighlights = highlightsString
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean);
              } else if (founder?.highlights) {
                // Fallback: handle as string
                founderHighlights = String(founder.highlights)
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean);
              }

              return (
                <div
                  key={`founder-${idx}`}
                  className={`flex flex-col items-stretch gap-6 md:flex-row ${
                    idx % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Founder Image or Avatar */}
                  <div className="w-full md:w-1/2">
                    {founderImg ? (
                      <img
                        src={founderImg}
                        alt={founder?.name || "Founder"}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-2xl bg-white/10">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-32 w-32 text-white/30"
                          fill="currentColor"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Founder Info */}
                  <div className="flex w-full flex-col justify-start text-left md:w-1/2 md:px-8">
                    <h3 className="text-[22px] font-semibold text-[#f7e53f] md:text-[28px]">
                      {founder.name}
                    </h3>
                    <p className="mt-1 text-[15px] font-medium text-white/70">
                      {founder.role}
                    </p>
                    <p className="mt-4 font-['Poppins',ui-sans-serif,system-ui,sans-serif] text-[14px] leading-[1.7] text-white/85 md:text-[16px]">
                      {founder.bio}
                    </p>
                    {founderHighlights.length ? (
                      <ul className="mt-4 list-inside list-disc space-y-1 text-[14px] font-semibold text-white/75">
                        {founderHighlights.map((h, hi) => (
                          <li key={`fhi-${hi}`}>{h}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Team Cards Section */}
        {teamCards.length > 0 ? (
          <div className="mt-10 md:mt-14">
            {data?.aboutPageTeamHeading ? (
              <h3 className="mb-6 text-center text-[22px] font-semibold text-[#f7e53f] md:text-[28px]">
                {data.aboutPageTeamHeading}
              </h3>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {teamCards.map((card, idx) => {
                const cardImage = card?.image ? getMediaUrl(card.image) : "";
                const hasValidImage = cardImage && cardImage.trim().length > 0;
                
                return (
                  <article
                    key={`about-card-${idx}`}
                    className="overflow-hidden rounded-2xl bg-[#111111] text-white shadow-sm"
                  >
                    {hasValidImage ? (
                      <img
                        src={cardImage}
                        alt={card?.title || `About Card ${idx + 1}`}
                        className="h-[350px] w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-[350px] w-full items-center justify-center bg-white/5">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-24 w-24 text-white/20"
                          fill="currentColor"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                    <div className="p-4 text-left">
                      {card?.title ? (
                        <h4 className="text-lg font-semibold">{card.title}</h4>
                      ) : null}
                      {card?.description ? (
                        <p className="mt-2 text-sm leading-6 text-white/85">
                          {card.description}
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default TemplateAboutPage;
