import React from "react";
import { useTemplateData } from "./templates/useTemplateData";
import { ACCENT, CARD, FONT_IMPORT, HEADING, HEADING_FONT, LinedHeading, MUTED, PAGE_BG, PAGE_WRAP, TEXT } from "./templates/freshStudio/FreshStudioShared";
import { getMediaSrc } from "./utils/templateRouteUtils";

const getNonEmptyTextList = (...values) => values.map((v) => String(v || "").trim()).filter(Boolean);

const FreshStudioTemplateAboutPage = () => {
  const t = useTemplateData();
  const { data } = t;

  if (t.isPending) return null;
  if (t.error) return <div>Error loading about page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const aboutBlocks = Array.isArray(data?.about) ? data.about : [];
  const aboutIntroBlocks = getNonEmptyTextList(
    data?.aboutPageIntro,
    data?.aboutPageOverview,
    ...aboutBlocks.map((block) => (typeof block === "string" ? block : block?.text)),
  );
  const aboutNarrativeBlocks = [
    { title: data?.aboutPageStoryHeading || "Our Story", body: String(data?.aboutPageStory || "").trim() },
    { title: data?.aboutPageMissionHeading || "Our Mission", body: String(data?.aboutPageMission || "").trim() },
    { title: data?.aboutPageVisionHeading || "Our Vision", body: String(data?.aboutPageVision || "").trim() },
    { title: data?.aboutPageValuesHeading || "Our Values", body: String(data?.aboutPageValues || "").trim() },
  ].filter((item) => item.body);
  const aboutPageImageCards = Array.isArray(data?.aboutPageImageCards)
    ? data.aboutPageImageCards.filter((card) => String(card?.title || "").trim() || String(card?.description || "").trim() || card?.image)
    : [];
  const founders = Array.isArray(data?.founders) ? data.founders.filter((f) => String(f?.name || "").trim()) : [];

  return (
    <div className="min-h-screen font-['Work_Sans',ui-sans-serif,system-ui,sans-serif]" style={{ backgroundColor: PAGE_BG, color: TEXT }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        <LinedHeading title="About us" className="mb-2" style={{ color: ACCENT }} />
        <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center gap-4 text-center">
          {aboutIntroBlocks.map((text, idx) => (
            <p key={idx} className="text-[15px] leading-relaxed">
              {text}
            </p>
          ))}
        </div>

        {aboutNarrativeBlocks.length ? (
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {aboutNarrativeBlocks.map((item) => (
              <div key={item.title} className={`${CARD} border p-5`} style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em]" style={{ color: ACCENT }}>
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {founders.length ? (
          <div className="mt-14 flex flex-col gap-16">
            <LinedHeading title="Founders" style={{ color: ACCENT }} />
            {founders.map((founder, idx) => {
              const founderImg = getMediaSrc(founder?.image);
              return (
                <div key={idx} className={`flex flex-col items-stretch gap-6 md:flex-row md:gap-10 ${idx % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                  <div className="w-full md:w-1/2">
                    {founderImg ? (
                      <img src={founderImg} alt={founder?.name} className="h-full min-h-[280px] w-full rounded-[4px] object-cover md:min-h-[420px]" />
                    ) : (
                      <div className="h-full min-h-[280px] w-full rounded-[4px] md:min-h-[420px]" style={{ backgroundColor: "#15151f" }} />
                    )}
                  </div>
                  <div className="flex w-full flex-col justify-center md:w-1/2">
                    <h4 className={`text-[22px] font-bold ${HEADING_FONT} md:text-[26px]`} style={{ color: HEADING }}>
                      {founder?.name}
                    </h4>
                    <p className="mt-1 text-[14px] font-semibold" style={{ color: ACCENT }}>
                      {founder?.role}
                    </p>
                    <p className="mt-3 text-[14.5px] leading-relaxed">{founder?.bio}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {aboutPageImageCards.length ? (
          <div className="mt-14 flex flex-col gap-8">
            <LinedHeading title={data?.aboutPageTeamHeading || "Our Team"} style={{ color: ACCENT }} />
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-8">
              {aboutPageImageCards.map((card, idx) => {
                const image = getMediaSrc(card?.image);
                return (
                  <div key={idx} className="w-[calc(50%-12px)] shrink-0 grow-0 sm:w-[calc(33.333%-16px)] lg:w-[calc(20%-19.2px)]">
                    {image ? (
                      <img src={image} alt={card?.title || ""} className="aspect-square w-full rounded-[4px] object-cover" />
                    ) : (
                      <div className="aspect-square w-full rounded-[4px]" style={{ backgroundColor: "#15151f" }} />
                    )}
                    {card?.title ? (
                      <h5 className={`mt-3 text-[15px] font-bold ${HEADING_FONT}`} style={{ color: HEADING }}>
                        {card.title}
                      </h5>
                    ) : null}
                    {card?.description ? (
                      <p className="mt-1 text-[13px]" style={{ color: MUTED }}>
                        {card.description}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default FreshStudioTemplateAboutPage;
