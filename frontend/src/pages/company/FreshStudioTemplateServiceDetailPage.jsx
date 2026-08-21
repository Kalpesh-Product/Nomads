import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTemplateData } from "./templates/useTemplateData";
import {
  ACCENT,
  ACCENT_GRADIENT,
  CARD,
  EYEBROW,
  FaqList,
  FONT_IMPORT,
  HEADING,
  HEADING_FONT,
  Inclusions,
  INPUT,
  LinedHeading,
  MUTED,
  PAGE_BG,
  PAGE_WRAP,
  PILL_BUTTON,
  ProductGrid,
  TEXT,
  WHITE,
  focusStyle,
  inputFocusStyle,
  inputStyle,
} from "./templates/freshStudio/FreshStudioShared";
import { api } from "../../utils/axios";
import { getCatalogItemsForProductPage, getPageHeroImages } from "./utils/pageTemplateUtils";
import { getMediaSrc, normalizeSlug } from "./utils/templateRouteUtils";

const isMenuProductSlug = (slug) => {
  const normalized = normalizeSlug(slug, "");
  return normalized.includes("cafe") || normalized.includes("menu");
};

const getLeadFields = (pageSlug) => {
  const normalized = normalizeSlug(pageSlug, "");
  if (normalized.includes("meeting")) {
    return [
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "mobile", label: "Mobile Number", type: "tel", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "people", label: "No. Of Attendees", type: "number", required: true },
      { key: "startDate", label: "Meeting Date", type: "date", required: true },
      { key: "endDate", label: "Meeting End Date", type: "date", required: false },
    ];
  }
  if (normalized.includes("workation")) {
    return [
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "mobile", label: "Mobile Number", type: "tel", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "people", label: "No. Of Guests", type: "number", required: true },
      { key: "startDate", label: "Check-In Date", type: "date", required: true },
      { key: "endDate", label: "Check-Out Date", type: "date", required: true },
    ];
  }
  if (normalized.includes("co-living") || normalized.includes("coliving")) {
    return [
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "mobile", label: "Mobile Number", type: "tel", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "people", label: "No. Of Occupants", type: "number", required: true },
      { key: "startDate", label: "Move-In Date", type: "date", required: true },
      { key: "endDate", label: "Preferred Stay Until", type: "date", required: false },
    ];
  }
  if (normalized.includes("hostel")) {
    return [
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "mobile", label: "Mobile Number", type: "tel", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "people", label: "Beds Required", type: "number", required: true },
      { key: "startDate", label: "Check-In Date", type: "date", required: true },
      { key: "endDate", label: "Check-Out Date", type: "date", required: true },
    ];
  }
  return [
    { key: "fullName", label: "Full Name", type: "text", required: true },
    { key: "mobile", label: "Mobile Number", type: "tel", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "people", label: "No. Of People", type: "number", required: false },
    { key: "startDate", label: "Start Date", type: "date", required: false },
    { key: "endDate", label: "End Date", type: "date", required: false },
  ];
};

const FreshStudioTemplateServiceDetailPage = () => {
  const { slug, itemSlug } = useParams();
  const t = useTemplateData();
  const { data, rawProductDropdownPages } = t;
  const [productHeroIndex, setProductHeroIndex] = useState(0);
  const [leadForm, setLeadForm] = useState({ fullName: "", people: "", mobile: "", email: "", startDate: "", endDate: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitPending, setLeadSubmitPending] = useState(false);
  const [leadSubmitError, setLeadSubmitError] = useState("");

  if (t.isPending) return null;
  if (t.error) return <div>Error loading product page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const page =
    t.productPages.find((item) => item.slug === slug) ||
    t.productPages.find((item) => normalizeSlug(item?.slug || item?.name || "", "") === slug);

  if (!page) {
    return (
      <div className="min-h-screen font-['Work_Sans',ui-sans-serif,system-ui,sans-serif]" style={{ backgroundColor: PAGE_BG, color: TEXT }}>
        <style>{FONT_IMPORT}</style>
        <section className={PAGE_WRAP}>
          <div className="text-center">
            <h1 className={`text-[20px] font-semibold ${HEADING_FONT}`} style={{ color: HEADING }}>
              Service Page Not Found
            </h1>
            <p className="mt-2 text-[14px]" style={{ color: MUTED }}>
              This page is not configured for this website.
            </p>
            <button
              type="button"
              onClick={() => t.goToSection("products")}
              className={`${PILL_BUTTON} mt-6`}
              style={{ background: ACCENT_GRADIENT, color: WHITE }}
            >
              Back to Services
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Raw (un-normalized) productDropdownPages so inclusions never get lost to
  // normalization — same defensive lookup ClassicTemplateServiceDetailPage
  // uses, since it's the source of truth this live renderer already trusts.
  const pageInclusions = (() => {
    const sources = [rawProductDropdownPages, data?.productDropdownPages];
    for (const source of sources) {
      if (!Array.isArray(source)) continue;
      const match = source.find((p) => normalizeSlug(p?.slug || p?.name || "", "") === slug);
      if (Array.isArray(match?.inclusions) && match.inclusions.length > 0) return match.inclusions;
    }
    return [];
  })();

  const heroImages = getPageHeroImages(page);
  const selectedProductHeroImages = heroImages;
  const selectedProductHeroImage = selectedProductHeroImages[productHeroIndex] || heroImages[0] || "";
  const productCatalog = getCatalogItemsForProductPage(data, page);
  const productPageName = String(page?.name || page?.heading || "").trim();

  const selectedDetailItem = itemSlug
    ? productCatalog.find((item) => normalizeSlug(item?.name || item?.title || "", "") === itemSlug)
    : null;

  const leadFormFields = getLeadFields(page?.slug || page?.name || "");

  const submitLeadForm = async (event) => {
    event.preventDefault();
    setLeadSubmitPending(true);
    setLeadSubmitError("");
    try {
      await api.post("/leads/create-lead", {
        fullName: leadForm.fullName,
        name: leadForm.fullName,
        mobileNumber: leadForm.mobile,
        mobile: leadForm.mobile,
        phone: leadForm.mobile,
        email: leadForm.email,
        noOfPeople: leadForm.people || 1,
        people: leadForm.people || 1,
        attendees: leadForm.people || 1,
        startDate: leadForm.startDate || undefined,
        endDate: leadForm.endDate || undefined,
        source: "website",
        inquiryType: productPageName || "Product Enquiry",
        productType: productPageName || "",
        packageName: selectedDetailItem?.name || selectedDetailItem?.title || "",
        companyName: data?.companyName || "",
        companyId: data?.companyId || "",
        workspaceId: data?.workspaceId || "",
        searchKey: data?.searchKey || "",
        vertical: data?.vertical || "",
        websiteUrl: window.location.href,
      });
      setLeadSubmitted(true);
    } catch (error) {
      console.error("Failed to submit lead:", error);
      setLeadSubmitError(error?.response?.data?.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setLeadSubmitPending(false);
    }
  };

  return (
    <div className="min-h-screen font-['Work_Sans',ui-sans-serif,system-ui,sans-serif]" style={{ backgroundColor: PAGE_BG, color: TEXT }}>
      <style>{FONT_IMPORT}</style>
      {selectedDetailItem ? (
        <>
          <section className={PAGE_WRAP}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-12">
              <div className="w-full">
                {getMediaSrc(selectedDetailItem?.images) || getMediaSrc(selectedDetailItem?.cardImage) ? (
                  <img
                    src={getMediaSrc(selectedDetailItem?.images) || getMediaSrc(selectedDetailItem?.cardImage)}
                    alt={selectedDetailItem?.name || selectedDetailItem?.title || "Service"}
                    className="h-[300px] w-full rounded-[4px] object-cover md:h-[520px]"
                  />
                ) : (
                  <div className="h-[300px] w-full rounded-[4px] md:h-[520px]" style={{ backgroundColor: "#15151f" }} />
                )}
              </div>

              <div className="flex flex-col md:h-[520px]">
                <div className="shrink-0">
                  <h1 className={`text-[24px] font-extrabold ${HEADING_FONT} md:text-[32px]`} style={{ color: HEADING }}>
                    {selectedDetailItem?.name || selectedDetailItem?.title || "Service"}
                  </h1>
                  {selectedDetailItem?.price || selectedDetailItem?.cost ? (
                    <p className="mt-1 text-[15px]" style={{ color: MUTED }}>
                      {selectedDetailItem?.price || selectedDetailItem?.cost}
                    </p>
                  ) : null}
                </div>

                <div className="flex-1 overflow-y-auto py-2 pr-1">
                  {selectedDetailItem?.description ? (
                    <ul className="space-y-2">
                      {selectedDetailItem.description
                        .split(/\n|(?<=\.)\s+/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((point, i) => (
                          <li key={`desc-bullet-${i}`} className="flex items-start gap-2 text-[13px] leading-relaxed md:text-[14px]" style={{ color: MUTED }}>
                            <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />
                            <span>{point}</span>
                          </li>
                        ))}
                    </ul>
                  ) : null}
                </div>

                <div className="shrink-0">
                  {leadSubmitted ? (
                    <div className={`${CARD} flex h-full min-h-[220px] flex-col items-center justify-center gap-3 border p-6 text-center`} style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                      <p className="text-[16px] font-semibold" style={{ color: HEADING }}>
                        Enquiry submitted successfully.
                      </p>
                      <p className="text-[13px]" style={{ color: MUTED }}>
                        We'll get back to you shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={submitLeadForm} className={`${CARD} flex flex-col gap-3 border p-5`} style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                      <span className={EYEBROW} style={{ color: ACCENT }}>
                        Enquire now
                      </span>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {leadFormFields.map((field) => (
                          <input
                            key={field.key}
                            type={field.type === "date" ? "date" : field.type}
                            required={field.required}
                            placeholder={field.label}
                            value={leadForm[field.key] ?? ""}
                            onChange={(e) => setLeadForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            className={INPUT}
                            style={{ ...inputStyle, ...inputFocusStyle }}
                          />
                        ))}
                      </div>
                      {leadSubmitError ? <p className="text-[12px] text-[#D94B4B]">{leadSubmitError}</p> : null}
                      <button
                        type="submit"
                        disabled={leadSubmitPending}
                        className={`${PILL_BUTTON} mt-1 disabled:opacity-50`}
                        style={{ background: ACCENT_GRADIENT, color: WHITE, ...focusStyle }}
                      >
                        {leadSubmitPending ? "Submitting…" : "Submit enquiry"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>
          {pageInclusions.length > 0 ? <Inclusions inclusions={pageInclusions} title={`${productPageName} Inclusions`} /> : null}
          <FaqList faqs={Array.isArray(data?.faqs) ? data.faqs : []} />
        </>
      ) : (
        <>
          <section className="relative h-[62svh] min-h-[450px] overflow-hidden md:h-[84vh] md:min-h-[550px]" style={{ backgroundColor: "#15151f" }}>
            {selectedProductHeroImage ? (
              <img src={selectedProductHeroImage} alt={page?.name || "Service"} className="absolute inset-0 h-full w-full object-cover opacity-60" />
            ) : null}
            <div className="absolute inset-0 flex items-end justify-center px-4 pb-10 text-center text-white md:pb-16">
              <div>
                <h1 className={`text-[26px] font-bold ${HEADING_FONT} md:text-4xl`} style={{ color: WHITE }}>
                  {page?.heroHeading || page?.name}
                </h1>
                {page?.heroSubHeading ? (
                  <p className="mt-2 text-[13px] leading-relaxed md:mt-3 md:text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {page.heroSubHeading}
                  </p>
                ) : null}
                {page?.heroButtonText ? (
                  <button type="button" className={`${PILL_BUTTON} mt-4 md:mt-6`} style={{ background: ACCENT_GRADIENT, color: WHITE }}>
                    {String(page.heroButtonText).toUpperCase()}
                  </button>
                ) : null}
              </div>
            </div>
            {page?.heroMode === "carousel" && selectedProductHeroImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setProductHeroIndex((prev) => (prev - 1 + selectedProductHeroImages.length) % selectedProductHeroImages.length)}
                  className="absolute left-5 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 px-4 py-2 text-2xl text-white md:block focus-visible:outline focus-visible:outline-2"
                  style={{ outlineColor: WHITE }}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setProductHeroIndex((prev) => (prev + 1) % selectedProductHeroImages.length)}
                  className="absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 px-4 py-2 text-2xl text-white md:block focus-visible:outline focus-visible:outline-2"
                  style={{ outlineColor: WHITE }}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            ) : null}
          </section>

          <section className={PAGE_WRAP}>
            <LinedHeading
              title={`${productPageName || "Our"} ${isMenuProductSlug(page?.slug || "") ? "Menu" : "Services"}`}
              className="mb-6"
              style={{ color: ACCENT }}
            />
            {isMenuProductSlug(page?.slug || "") ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                {(Array.isArray(data?.menuItems) ? data.menuItems : []).map((item, idx) => (
                  <div key={idx} className={`${CARD} border p-4`} style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                    {item?.image ? <img src={item.image} alt={item?.name} className="aspect-[4/3] w-full rounded-[4px] object-cover" /> : null}
                    <div className="mt-3 flex items-center justify-between">
                      <h4 className="text-[14px] font-semibold" style={{ color: HEADING }}>
                        {item?.name}
                      </h4>
                      {item?.price ? (
                        <span className="text-[13px]" style={{ color: MUTED }}>
                          {item.price}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid
                products={productCatalog.length ? productCatalog : [page]}
                fallbackImage={typeof page?.cardImage === "string" ? page.cardImage : page?.cardImage?.url || ""}
                onSelect={(item) => t.goToProductItem(page?.slug || page?.name || "", item?.title || item?.name || item?.heading || "")}
              />
            )}
          </section>
          {pageInclusions.length > 0 ? <Inclusions inclusions={pageInclusions} title={`${productPageName} Inclusions`} /> : null}
          <FaqList faqs={Array.isArray(data?.faqs) ? data.faqs : []} />
        </>
      )}
    </div>
  );
};

export default FreshStudioTemplateServiceDetailPage;
