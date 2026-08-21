import React from "react";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BROWN,
  CREAM,
  FONT_IMPORT,
  LinedHeading,
  MUTED,
  PAGE_WRAP,
  RUST,
  SANS,
  SERIF,
} from "./templates/warmOrganic/WarmOrganicShared";
import { getMediaSrc } from "./utils/templateRouteUtils";

const getNonEmptyTextList = (...values) => values.map((v) => String(v || "").trim()).filter(Boolean);

const WarmOrganicTemplateAboutPage = () => {
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
    <div className={`wo-template min-h-screen ${SANS}`} style={{ backgroundColor: "#F1E6D3", color: BROWN }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        <LinedHeading title={String(data?.aboutTitle || "").trim() || "About Our Vision"} className="justify-center" />
        <div className="mt-6 flex max-w-2xl flex-col gap-4 mx-auto">
          {aboutIntroBlocks.map((text, idx) => (
            <p key={idx} className="text-[15px] leading-relaxed" style={{ color: MUTED }}>
              {text}
            </p>
          ))}
        </div>

        {aboutNarrativeBlocks.length ? (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {aboutNarrativeBlocks.map((item) => (
              <div key={item.title} className="rounded-2xl p-6" style={{ backgroundColor: CREAM }}>
                <h3 className={`text-[18px] font-normal ${SERIF}`} style={{ color: RUST }}>
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
          <div className="mt-16 flex flex-col gap-12">
            <LinedHeading title="Our Founders" className="justify-center" />
            {founders.map((founder, idx) => {
              const founderImg = getMediaSrc(founder?.image);
              return (
                <div key={idx} className="grid gap-6 md:grid-cols-[0.35fr_0.65fr]">
                  {founderImg ? (
                    <img src={founderImg} alt={founder?.name} className="aspect-square w-full rounded-3xl object-cover" />
                  ) : (
                    <div className="aspect-square w-full rounded-3xl" style={{ backgroundColor: `${BROWN}0D` }} />
                  )}
                  <div>
                    <h4 className={`text-[20px] font-normal ${SERIF}`}>{founder?.name}</h4>
                    <p className="text-[13px]" style={{ color: RUST }}>
                      {founder?.role}
                    </p>
                    <p className="mt-3 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                      {founder?.bio}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {aboutPageImageCards.length ? (
          <div className="mt-16 flex flex-col gap-8">
            <LinedHeading title={data?.aboutPageTeamHeading || "Our Team"} className="justify-center" />
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-8">
              {aboutPageImageCards.map((card, idx) => {
                const image = getMediaSrc(card?.image);
                return (
                  <div key={idx} className="w-[calc(50%-12px)] shrink-0 grow-0 sm:w-[calc(33.333%-16px)] lg:w-[calc(20%-19.2px)]">
                    {image ? (
                      <img src={image} alt={card?.title || ""} className="aspect-square w-full rounded-2xl object-cover" />
                    ) : (
                      <div className="aspect-square w-full rounded-2xl" style={{ backgroundColor: `${BROWN}0D` }} />
                    )}
                    {card?.title ? (
                      <h5 className={`mt-3 text-[15px] font-normal ${SERIF}`}>{card.title}</h5>
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

export default WarmOrganicTemplateAboutPage;
