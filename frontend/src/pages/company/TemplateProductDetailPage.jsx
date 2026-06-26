import React, { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Container from "../../components/Container";
import ProductCard from "./components/ProductCard";
import ProductModalContent from "./components/ProductModalContent";
import TempModal from "./components/TempModal";
import FaqAccordion from "./components/FaqAccordion";
import InclusionsSection from "./components/InclusionsSection";
import LinedHeading from "./components/LinedHeading";
import { api } from "../../utils/axios";
import {
  getCatalogItemsForProductPage,
  getPageHeroImages,
  getEnabledProductPages,
} from "./utils/pageTemplateUtils";
import {
  getMediaSrc,
  getSectionPath,
  normalizeSlug,
} from "./utils/templateRouteUtils";

const TemplateProductDetailPage = () => {
  const { slug, itemSlug } = useParams();
  const navigate = useNavigate();
  const { data, isPending, error, routeContext } = useOutletContext();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);
  
  if (isPending) return null;
  if (error) return <div>Error loading product page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const productPages =
    Array.isArray(data?.productPages) && data.productPages.length > 0
      ? data.productPages
      : getEnabledProductPages(data?.productDropdownPages);
  const page =
    productPages.find((item) => item.slug === slug) ||
    productPages.find((item) => normalizeSlug(item?.slug || item?.name || "") === slug);

  if (!page) {
    return (
      <section className="min-h-[50vh] bg-[#efefef] py-0">
        <Container>
          <div className="text-center">
            <h1 className="text-title font-semibold">Product Page Not Found</h1>
            <p className="mt-2 text-gray-600">
              This page is not configured for this website.
            </p>
            <button
              type="button"
              onClick={() =>
                navigate(getSectionPath("products", routeContext?.prefix || ""))
              }
              className="mt-6 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/80"
            >
              Back to Products
            </button>
          </div>
        </Container>
      </section>
    );
  }

  const heroImages = getPageHeroImages(page);
  const heroImage = heroImages[0] || "";
  const [productHeroIndex, setProductHeroIndex] = useState(0);
  const selectedProductHeroImages = heroImages.length > 0 ? heroImages : [];
  const selectedProductHeroImage = selectedProductHeroImages[productHeroIndex] || heroImage;
  const isCafePage = normalizeSlug(page?.slug || page?.name || "").includes("cafe");
  const productSummary =
    page?.description || page?.heroSubHeading || page?.homeCardSubText || "";
  const productCatalog = getCatalogItemsForProductPage(data, page);

  // Check if we're viewing a specific item detail
  const selectedDetailItem = itemSlug
    ? productCatalog.find((item) => normalizeSlug(item?.name || item?.title || "") === itemSlug)
    : null;

  // Get dynamic form fields based on product category
  const getLeadFields = () => {
    const pageSlug = normalizeSlug(page?.slug || page?.name || "");
    
    if (pageSlug.includes("meeting")) {
      return {
        fields: [
          { key: "fullName", label: "Full Name", type: "text", required: true },
          { key: "mobile", label: "Mobile Number", type: "tel", required: true },
          { key: "email", label: "Email", type: "email", required: true },
          { key: "people", label: "No. Of Attendees", type: "number", required: true },
          { key: "startDate", label: "Meeting Date", type: "date", required: true },
          { key: "endDate", label: "Meeting End Date", type: "date", required: false },
        ],
        initialValues: { fullName: "", people: "", mobile: "", email: "", startDate: "", endDate: "" }
      };
    }
    
    if (pageSlug.includes("workation")) {
      return {
        fields: [
          { key: "fullName", label: "Full Name", type: "text", required: true },
          { key: "mobile", label: "Mobile Number", type: "tel", required: true },
          { key: "email", label: "Email", type: "email", required: true },
          { key: "people", label: "No. Of Guests", type: "number", required: true },
          { key: "startDate", label: "Check-In Date", type: "date", required: true },
          { key: "endDate", label: "Check-Out Date", type: "date", required: true },
        ],
        initialValues: { fullName: "", people: "", mobile: "", email: "", startDate: "", endDate: "" }
      };
    }
    
    if (pageSlug.includes("co-living") || pageSlug.includes("coliving")) {
      return {
        fields: [
          { key: "fullName", label: "Full Name", type: "text", required: true },
          { key: "mobile", label: "Mobile Number", type: "tel", required: true },
          { key: "email", label: "Email", type: "email", required: true },
          { key: "people", label: "No. Of Occupants", type: "number", required: true },
          { key: "startDate", label: "Move-In Date", type: "date", required: true },
          { key: "endDate", label: "Preferred Stay Until", type: "date", required: false },
        ],
        initialValues: { fullName: "", people: "", mobile: "", email: "", startDate: "", endDate: "" }
      };
    }
    
    if (pageSlug.includes("hostel")) {
      return {
        fields: [
          { key: "fullName", label: "Full Name", type: "text", required: true },
          { key: "mobile", label: "Mobile Number", type: "tel", required: true },
          { key: "email", label: "Email", type: "email", required: true },
          { key: "people", label: "Beds Required", type: "number", required: true },
          { key: "startDate", label: "Check-In Date", type: "date", required: true },
          { key: "endDate", label: "Check-Out Date", type: "date", required: true },
        ],
        initialValues: { fullName: "", people: "", mobile: "", email: "", startDate: "", endDate: "" }
      };
    }
    
    // Default: Co-Working or generic
    return {
      fields: [
        { key: "fullName", label: "Full Name", type: "text", required: true },
        { key: "mobile", label: "Mobile Number", type: "tel", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "people", label: "No. Of People", type: "number", required: false },
        { key: "startDate", label: "Start Date", type: "date", required: false },
        { key: "endDate", label: "End Date", type: "date", required: false },
      ],
      initialValues: { fullName: "", people: "", mobile: "", email: "", startDate: "", endDate: "" }
    };
  };

  const leadConfig = getLeadFields();
  const [leadForm, setLeadForm] = useState(leadConfig.initialValues);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitPending, setLeadSubmitPending] = useState(false);
  const [leadSubmitError, setLeadSubmitError] = useState("");

  const openProductDetails = (item) => {
    // Navigate to the item detail page
    const itemSlugNormalized = normalizeSlug(item?.name || item?.title || "");
    
    // Use the current slug parameter instead of normalizing again
    const currentSlug = slug;
    
    // Build the correct path based on current location
    const currentPath = window.location.pathname;
    const basePath = currentPath.includes('/page/') ? '/page/products' : '/products';
    
    navigate(`${basePath}/${currentSlug}/${itemSlugNormalized}`);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setLeadSubmitPending(true);
    setLeadSubmitError("");

    try {
      await api.post("/api/leads/create-lead", {
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
        inquiryType: productPageName || page?.name || "Product Enquiry",
        productType: productPageName || page?.name || "",
        packageName: selectedDetailItem?.name || selectedDetailItem?.title || "",
        companyName: data?.companyName || "",
        companyId: data?.companyId || "",
        workspaceId: data?.workspaceId || "",
        searchKey: data?.searchKey || "",
        vertical: data?.vertical || "",
        websiteUrl: window.location.href,
      });

      setLeadSubmitted(true);
      setLeadForm({ fullName: "", people: "", mobile: "", email: "", startDate: "", endDate: "" });
    } catch (error) {
      console.error("Failed to submit lead:", error);
      setLeadSubmitError(
        error?.response?.data?.message || "Failed to submit enquiry. Please try again."
      );
    } finally {
      setLeadSubmitPending(false);
    }
  };

  // Get the product page name for the heading
  const productPageName = String(page?.name || page?.heading || "").trim();

  return (
    <div className="w-full bg-[#efefef]">{selectedDetailItem ? (
        <>
          {/* Item Detail Page: Image Left, Content + Form Right */}
          <section className="bg-[#efefef] px-4 py-2 md:px-6 md:py-4">
            <Container>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-12">
                {/* Left: Image */}
                <div className="w-full">
                  {getMediaSrc(selectedDetailItem?.images) || getMediaSrc(selectedDetailItem?.cardImage) ? (
                    <img
                      src={getMediaSrc(selectedDetailItem?.images) || getMediaSrc(selectedDetailItem?.cardImage)}
                      alt={selectedDetailItem?.name || selectedDetailItem?.title || "Product"}
                      className="h-[300px] w-full rounded-2xl object-cover md:h-[520px]"
                    />
                  ) : (
                    <div className="h-[300px] w-full rounded-2xl bg-slate-200 md:h-[520px]" />
                  )}
                </div>

                {/* Right: Content + Form */}
                <div className="flex flex-col font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:h-[520px]">
                  {/* Title & Price */}
                  <div className="shrink-0">
                    <h1 className="text-[24px] font-bold text-[#111827] font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[32px]">
                      {selectedDetailItem?.name || selectedDetailItem?.title || "Product"}
                    </h1>
                    {selectedDetailItem?.price || selectedDetailItem?.cost ? (
                      <p className="mt-1 text-[15px] font-semibold text-[#374151] font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[17px]">
                        {selectedDetailItem?.price || selectedDetailItem?.cost}
                      </p>
                    ) : null}
                  </div>

                  {/* Description - scrollable middle zone */}
                  <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
                    {selectedDetailItem?.description ? (
                      <ul className="space-y-2">
                        {selectedDetailItem.description
                          .split(/\n|(?<=\.)\s+/)
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((point, i) => (
                            <li
                              key={`desc-bullet-${i}`}
                              className="flex items-start gap-2 text-[13px] leading-relaxed text-[#4b5563] font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[14px]"
                            >
                              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7280]" />
                              <span>{point}</span>
                            </li>
                          ))}
                      </ul>
                    ) : null}

                    {/* Features/Amenities */}
                    {Array.isArray(selectedDetailItem?.features) && selectedDetailItem.features.length > 0 ? (
                      <ul className="space-y-2 border-t border-slate-300 pt-3">
                        {selectedDetailItem.features.map((point, i) => (
                          <li
                            key={`detail-bullet-${i}`}
                            className="flex items-start gap-2 text-[13px] text-[#374151] font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[14px]"
                          >
                            <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#111827]" />
                            <span>{typeof point === 'string' ? point : point?.name || point?.label || ''}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  {/* Lead Form - pinned at bottom */}
                  <div className="shrink-0">
                    {leadSubmitted ? (
                      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-5 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
                          ✓
                        </div>
                        <div className="space-y-2">
                          <p className="text-[20px] font-bold text-green-700 font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[24px]">
                            Enquiry Submitted Successfully!
                          </p>
                          <p className="text-[14px] text-green-600 font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[16px]">
                            We'll get back to you shortly.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLeadSubmitted(false);
                            setLeadForm(leadConfig.initialValues);
                          }}
                          className="rounded-full border-2 border-green-600 px-7 py-2.5 text-[13px] font-semibold uppercase tracking-wider text-green-700 transition hover:bg-green-600 hover:text-white font-['Poppins',ui-sans-serif,system-ui,sans-serif]"
                        >
                          Submit Another
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        {leadSubmitPending ? (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/90 backdrop-blur-[2px]">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#111827]" />
                            <p className="text-[12px] font-medium text-[#374151] font-['Poppins',ui-sans-serif,system-ui,sans-serif]">
                              Submitting...
                            </p>
                          </div>
                        ) : null}
                        <form
                          onSubmit={handleLeadSubmit}
                          className="flex flex-col gap-4 rounded-2xl border border-slate-300 bg-white p-5"
                        >
                          <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[#111827] font-['Poppins',ui-sans-serif,system-ui,sans-serif]">
                            Enquire Now
                          </h2>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {leadConfig.fields.map((field) => (
                              <div key={field.key} className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280] font-['Poppins',ui-sans-serif,system-ui,sans-serif]">
                                  {field.label}{field.required && <span className="ml-0.5 text-red-500">*</span>}
                                </label>
                                <input
                                  type={field.type}
                                  required={field.required}
                                  value={leadForm[field.key] || ""}
                                  onChange={(e) => setLeadForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-[#111827] outline-none transition font-['Poppins',ui-sans-serif,system-ui,sans-serif] focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                                />
                              </div>
                            ))}
                          </div>
                          {leadSubmitError ? (
                            <p className="text-[12px] text-red-500 font-['Poppins',ui-sans-serif,system-ui,sans-serif]">
                              {leadSubmitError}
                            </p>
                          ) : null}
                          <button
                            type="submit"
                            disabled={leadSubmitPending}
                            className="mt-1 w-full rounded-full bg-[#111827] px-6 py-3 text-[13px] font-semibold uppercase tracking-widest text-white transition font-['Poppins',ui-sans-serif,system-ui,sans-serif] hover:bg-[#1f2937] disabled:opacity-60"
                          >
                            Submit Enquiry
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* Inclusions for this specific product */}
          {(Array.isArray(page?.inclusions) && page.inclusions.length > 0) ? (
            <InclusionsSection 
              inclusions={page.inclusions} 
              title={`${productPageName} Inclusions`} 
            />
          ) : (Array.isArray(data?.inclusions) && data.inclusions.length > 0) ? (
            <InclusionsSection 
              inclusions={data.inclusions} 
              title={`${productPageName} Inclusions`} 
            />
          ) : null}

          {/* FAQ Section */}
          <FaqAccordion faqs={Array.isArray(data?.faqs) ? data.faqs : []} />
        </>
      ) : (
        <>
          {/* Full-bleed hero — no Container, no rounded corners, no horizontal margins */}
      <section className="relative h-[62svh] min-h-[380px] overflow-hidden bg-[#1f1f1f] md:h-[84vh] md:min-h-[520px]">
        {selectedProductHeroImage ? (
          <img
            src={selectedProductHeroImage}
            alt={page?.name || "Product Hero"}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
        ) : null}

        {/* Text overlay — bottom center */}
        <div className="absolute inset-0 z-10 flex items-end justify-center pb-10 md:pb-16">
          <div className="w-full text-center text-white">
            <h1 className="text-[26px] font-bold md:text-4xl">
              {page?.heroHeading || page?.name || "Product"}
            </h1>
            {page?.heroSubHeading ? (
              <p className="mt-2 text-[13px] leading-relaxed md:mt-3 md:text-lg">{page.heroSubHeading}</p>
            ) : null}
            {page?.heroButtonText ? (
              <button type="button" className="mt-4 rounded-full border border-white px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/10 md:mt-6 md:px-6 md:text-sm">
                {String(page.heroButtonText).toUpperCase()}
              </button>
            ) : null}
          </div>
        </div>

        {page?.heroMode === "carousel" && selectedProductHeroImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() =>
                setProductHeroIndex((prev) =>
                  (prev - 1 + selectedProductHeroImages.length) % selectedProductHeroImages.length,
                )
              }
              className="absolute left-5 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/45 px-4 py-2 text-2xl text-white md:block"
            >
              {"<"}
            </button>
            <button
              type="button"
              onClick={() =>
                setProductHeroIndex((prev) => (prev + 1) % selectedProductHeroImages.length)
              }
              className="absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/45 px-4 py-2 text-2xl text-white md:block"
            >
              {">"}
            </button>
          </>
        ) : null}
      </section>

      {/* Product catalog section — 32px top breathing room, standard side padding */}
      <section id="product-catalog" className="pb-10 pt-8">
        <Container padding={false} className="px-4 md:px-6">
          <div className="flex flex-col gap-6">
            <LinedHeading 
              title={isCafePage 
                ? `${productPageName} Menu` 
                : `${productPageName} Products`}
            />
            {productSummary && isCafePage ? (
              <p className="text-center text-gray-600">{productSummary}</p>
            ) : null}
            {isCafePage ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {productCatalog.map((item, index) => (
                  <article key={item?.name || item?.title || `menu-${index}`} className="flex flex-col items-center">
                    <h3 className="mb-3 text-base font-medium md:text-xl">{item?.category || item?.name || `Item ${index + 1}`}</h3>
                    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-200">
                      {(() => {
                        const imgSrc = getMediaSrc(item?.image) || getMediaSrc(item?.cardImage) || getMediaSrc(item?.heroImage) || getMediaSrc(item?.images);
                        return imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={item?.name || `Menu Item ${index + 1}`}
                            className="h-[220px] w-full object-cover md:h-[300px]"
                          />
                        ) : (
                          <div className="h-[220px] w-full bg-slate-200 md:h-[300px]" />
                        );
                      })()}
                      <div className="absolute inset-0 bg-black/35" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-left text-white md:p-5">
                        <p className="text-[16px] font-semibold md:text-[18px]">{item?.name || `Item ${index + 1}`}</p>
                        {item?.price || item?.cost ? (
                          <p className="mt-1 text-[14px] font-semibold md:text-[16px]">{item?.price || item?.cost}</p>
                        ) : null}
                        {item?.description ? (
                          <p className="mt-2 max-w-[90%] text-[12px] leading-5 text-white/95 md:text-[15px] md:leading-6">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {productCatalog.map((item, index) => (
                  <ProductCard
                    key={item?.slug || item?.name || item?.title || `product-${index}`}
                    product={item}
                    showButton={true}
                    onClick={() => openProductDetails(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Inclusions for this product page */}
      {(Array.isArray(page?.inclusions) && page.inclusions.length > 0) ? (
        <InclusionsSection 
          inclusions={page.inclusions} 
          title={`${productPageName} Inclusions`} 
        />
      ) : (Array.isArray(data?.inclusions) && data.inclusions.length > 0) ? (
        <InclusionsSection 
          inclusions={data.inclusions} 
          title={`${productPageName} Inclusions`} 
        />
      ) : null}

      {/* FAQ Section */}
      <FaqAccordion faqs={Array.isArray(data?.faqs) ? data.faqs : []} />

      <TempModal
        width="w-[80%] lg:w-[60%]"
        bgColor="bg-white"
        open={open}
        onClose={() => setOpen(false)}
      >
        <ProductModalContent
          product={selectedProduct}
          company={data}
          onClose={() => setOpen(false)}
          forceCafeMode={isCafePage}
        />
      </TempModal>
        </>
      )}
    </div>
  );
};

export default TemplateProductDetailPage;
