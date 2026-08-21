import React from "react";
import { useTemplateData } from "./templates/useTemplateData";
import { CARD, FONT_IMPORT, ACCENT, LinedHeading, MailIcon, PAGE_BG, PAGE_WRAP, PhoneIcon, PinIcon, TEXT, focusStyle } from "./templates/freshStudio/FreshStudioShared";

const FreshStudioTemplateContactPage = () => {
  const t = useTemplateData();
  const { data } = t;

  if (t.isPending) return null;
  if (t.error) return <div>Error loading contact page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  return (
    <div className="min-h-screen font-['Work_Sans',ui-sans-serif,system-ui,sans-serif]" style={{ backgroundColor: PAGE_BG, color: TEXT }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        <LinedHeading title={data?.contactPageHeading || data?.contactTitle || "Get in touch"} className="mb-6" style={{ color: ACCENT }} />
        {data?.contactPageIntro ? (
          <p className="mb-6 text-center text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
            {data.contactPageIntro}
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[0.6fr_0.4fr]">
          {data?.mapUrl ? (
            <iframe title="map" src={data.mapUrl} className="h-[300px] w-full rounded-[4px] border-0 md:h-[420px]" loading="lazy" />
          ) : (
            <div className="h-[300px] w-full rounded-[4px] md:h-[420px]" style={{ backgroundColor: "#15151f" }} />
          )}
          <div className={`${CARD} border flex flex-col p-7`} style={{ borderColor: "rgba(255,255,255,0.12)" }}>
            {data?.companyLogoUrl ? (
              <img src={data.companyLogoUrl} alt={data.companyName || "Company"} className="mx-auto h-12 w-auto object-contain" />
            ) : null}
            <div className="mt-6 flex flex-col gap-4 text-[14.5px]">
              {t.contactEmail ? (
                <a href={`mailto:${t.contactEmail}`} className="flex items-center gap-3 hover:opacity-70 focus-visible:outline focus-visible:outline-2" style={focusStyle}>
                  <MailIcon />
                  {t.contactEmail}
                </a>
              ) : null}
              {t.contactPhone ? (
                <a
                  href={`tel:${t.contactPhone.replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-3 hover:opacity-70 focus-visible:outline focus-visible:outline-2"
                  style={focusStyle}
                >
                  <PhoneIcon />
                  {t.contactPhone}
                </a>
              ) : null}
              {t.contactAddress ? (
                <div className="flex items-start gap-3">
                  <span className="pt-0.5">
                    <PinIcon />
                  </span>
                  <span>{t.contactAddress}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FreshStudioTemplateContactPage;
