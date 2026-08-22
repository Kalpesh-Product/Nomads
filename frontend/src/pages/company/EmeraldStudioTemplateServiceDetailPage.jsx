import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BODY_FONT,
  FONT_IMPORT,
  HEADING_FONT,
  Inclusions,
  INPUT,
  LinedHeading,
  FaqList,
  ProductGrid,
  SECTION_BG,
  STYLE_OVERRIDES,
  TEMPLATE_ROOT_CLASS,
} from "./templates/emeraldStudio/EmeraldStudioShared";
import { api } from "../../utils/axios";
import { getCatalogItemsForProductPage, getPageHeroImages } from "./utils/pageTemplateUtils";
import { getMediaSrc, normalizeSlug } from "./utils/templateRouteUtils";

const isMenuProductSlug = (slug) => {
  const normalized = normalizeSlug(slug, "");
  return normalized.includes("cafe") || normalized.includes("menu");
};

// Same vertical-conditional lead field sets HostPanel's useWebsiteTemplateData
// hook (getLeadFieldsForProduct) and the other Nomads ports (Fresh Studio,
// Warm Organic) already use — duplicated locally here because Nomads' thin
// useTemplateData hook has no cross-section UI state, only read-only data +
// navigation.
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

const EmeraldStudioTemplateServiceDetailPage = () => {
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
      <div className={`${TEMPLATE_ROOT_CLASS} min-h-screen bg-[#002c22] text-stone-100 ${BODY_FONT}`}>
        <style>{`${FONT_IMPORT}${STYLE_OVERRIDES}`}</style>
        <section className={`pt-20 pb-16 px-6 ${SECTION_BG}`}>
          <div className="max-w-7xl mx-auto text-center">
            <h1 className={`text-2xl font-semibold text-stone-100 ${HEADING_FONT}`}>Service Page Not Found</h1>
            <p className="mt-2 text-sm text-stone-400">This page is not configured for this website.</p>
            <button
              type="button"
              onClick={() => t.goToSection("products")}
              className="mt-6 inline-flex items-center gap-2 bg-amber-400 text-emerald-950 font-semibold px-7 py-3 rounded hover:bg-amber-300 transition-colors text-sm"
            >
              Back to Services
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Raw (un-normalized) productDropdownPages so inclusions never get lost to
  // normalization — same defensive lookup Fresh Studio's / Warm Organic's
  // Nomads ports use.
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
  const leadFormFields = getLeadFields(page?.slug || page?.name || "");

  const selectedDetailItem = itemSlug
    ? productCatalog.find((item) => normalizeSlug(item?.name || item?.title || "", "") === itemSlug)
    : null;

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
    <div className={`${TEMPLATE_ROOT_CLASS} min-h-screen bg-[#002c22] text-stone-100 ${BODY_FONT}`}>
      <style>{`${FONT_IMPORT}${STYLE_OVERRIDES}`}</style>
      {selectedDetailItem ? (
        <>
          <section className={`pt-20 pb-24 px-6 ${SECTION_BG}`}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-14">
              <div className="w-full">
                {getMediaSrc(selectedDetailItem?.images) || getMediaSrc(selectedDetailItem?.cardImage) ? (
                  <img
                    src={getMediaSrc(selectedDetailItem?.images) || getMediaSrc(selectedDetailItem?.cardImage)}
                    alt={selectedDetailItem?.name || selectedDetailItem?.title || "Service"}
                    className="h-[300px] w-full rounded-2xl object-cover md:h-full"
                  />
                ) : (
                  <div className="h-[300px] w-full rounded-2xl bg-emerald-900 md:h-full" />
                )}
              </div>
              <div className="flex flex-col">
                <div className="shrink-0">
                  <LinedHeading title={page?.name || "Service"} className="justify-center md:justify-start" />
                  <h1 className={`text-3xl md:text-4xl font-semibold text-stone-100 mb-4 ${HEADING_FONT} text-center md:text-left`}>
                    {selectedDetailItem?.name || selectedDetailItem?.title || "Service"}
                  </h1>
                  {selectedDetailItem?.price || selectedDetailItem?.cost ? (
                    <p className="text-stone-400 text-lg mb-4 text-center md:text-left">{selectedDetailItem?.price || selectedDetailItem?.cost}</p>
                  ) : null}
                </div>
                <div className="flex-1 overflow-y-auto py-2 pr-1 md:max-h-[220px]">
                  {selectedDetailItem?.description ? (
                    <ul className="space-y-2">
                      {selectedDetailItem.description
                        .split(/\n|(?<=\.)\s+/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((point, i) => (
                          <li key={`desc-bullet-${i}`} className="flex items-start gap-2 text-sm leading-relaxed text-stone-400">
                            <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                            <span>{point}</span>
                          </li>
                        ))}
                    </ul>
                  ) : null}
                </div>
                <div className="shrink-0 min-h-[380px]">
                  {leadSubmitted ? (
                    <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-2xl border border-emerald-800/50 bg-emerald-900/30 p-8 text-center">
                      <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-emerald-950 text-2xl mb-4 mx-auto">✓</div>
                      <h3 className={`text-xl font-semibold text-stone-100 mb-2 ${HEADING_FONT}`}>Enquiry submitted!</h3>
                      <p className="text-stone-400 text-sm">We&apos;ll get back to you shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={submitLeadForm} className="bg-emerald-900/30 border border-emerald-800/50 rounded-2xl p-8 space-y-4">
                      <LinedHeading title="Enquire now" />
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {leadFormFields.map((field) => (
                          <div key={field.key}>
                            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">{field.label}</label>
                            <input
                              type={field.type === "date" ? "date" : field.type}
                              required={field.required}
                              placeholder={field.label}
                              value={leadForm[field.key] ?? ""}
                              onChange={(e) => setLeadForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                              className={INPUT}
                            />
                          </div>
                        ))}
                      </div>
                      {leadSubmitError ? <p className="text-xs text-red-400">{leadSubmitError}</p> : null}
                      <button
                        type="submit"
                        disabled={leadSubmitPending}
                        className="w-full bg-amber-400 text-emerald-950 font-semibold py-3.5 rounded-lg hover:bg-amber-300 transition-colors text-sm disabled:opacity-50"
                      >
                        {leadSubmitPending ? "Submitting…" : "Submit Enquiry"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>
          {pageInclusions.length > 0 ? <Inclusions inclusions={pageInclusions} title={`${productPageName} Inclusions`} /> : null}
          {page?.faqEnabled !== false ? <FaqList faqs={Array.isArray(data?.faqs) ? data.faqs : []} /> : null}
        </>
      ) : (
        <>
          {page?.heroEnabled !== false ? (
            <section className="relative h-[50svh] min-h-[320px] overflow-hidden md:h-[88vh] md:min-h-[400px] bg-[#002c22]">
              {selectedProductHeroImage ? (
                <img src={selectedProductHeroImage} alt={page?.name || "Service"} className="absolute inset-0 h-full w-full object-cover opacity-100" />
              ) : (
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage: "linear-gradient(#ffb900 1px, transparent 1px), linear-gradient(90deg, #ffb900 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                  }}
                />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 px-6 pb-10 text-center md:pb-14">
                <h1 className={`text-3xl md:text-5xl font-semibold text-stone-100 ${HEADING_FONT}`}>{page?.heroHeading || page?.name}</h1>
                {page?.heroSubHeading ? <p className="mx-auto mt-1 max-w-xl text-stone-400 text-base">{page.heroSubHeading}</p> : null}
                {page?.heroButtonText ? (
                  <button
                    type="button"
                    onClick={() => t.goToSection("contact")}
                    className="mt-2 inline-flex items-center gap-2 bg-amber-400 text-emerald-950 font-semibold px-7 py-3.5 rounded hover:bg-amber-300 transition-colors text-sm"
                  >
                    {page.heroButtonText}
                  </button>
                ) : null}
              </div>
              {page?.heroMode === "carousel" && selectedProductHeroImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setProductHeroIndex((prev) => (prev - 1 + selectedProductHeroImages.length) % selectedProductHeroImages.length)}
                    className="absolute left-5 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 px-4 py-2 text-2xl text-white md:block"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductHeroIndex((prev) => (prev + 1) % selectedProductHeroImages.length)}
                    className="absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 px-4 py-2 text-2xl text-white md:block"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              ) : null}
            </section>
          ) : null}
          <section className={`pt-16 pb-24 px-6 ${SECTION_BG}`}>
            <div className="max-w-7xl mx-auto">
              <LinedHeading
                title={`${productPageName || "Our"} ${isMenuProductSlug(page?.slug || "") ? "Menu" : "Services"}`}
                className="justify-center"
              />
              {isMenuProductSlug(page?.slug || "") ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {(Array.isArray(data?.menuItems) ? data.menuItems : []).map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-emerald-800/50 bg-emerald-900/40 p-5">
                      {item?.image ? <img src={item.image} alt={item?.name} className="aspect-[4/3] w-full rounded-lg object-cover" /> : null}
                      <div className="mt-3 flex items-center justify-between">
                        <h4 className={`text-[15px] font-semibold text-stone-100 ${HEADING_FONT}`}>{item?.name}</h4>
                        {item?.price ? <span className="text-[13px] text-stone-400">{item.price}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ProductGrid
                  products={productCatalog.length ? productCatalog : [page]}
                  onSelect={(item) => t.goToProductItem(page?.slug || page?.name || "", item?.title || item?.name || item?.heading || "")}
                />
              )}
            </div>
          </section>
          {pageInclusions.length > 0 ? <Inclusions inclusions={pageInclusions} title={`${productPageName} Inclusions`} /> : null}
          {page?.faqEnabled !== false ? <FaqList faqs={Array.isArray(data?.faqs) ? data.faqs : []} /> : null}
        </>
      )}
    </div>
  );
};

export default EmeraldStudioTemplateServiceDetailPage;
