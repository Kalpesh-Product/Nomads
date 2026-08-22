import React, { useEffect, useMemo, useRef } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
  useParams,
} from "react-router-dom";
import TempHeader from "./components/TempHeader";
import TempFooter from "./components/TempFooter";
import TemplateBreadcrumbs from "./components/TemplateBreadcrumbs";
import FreshStudioHeader from "./templates/freshStudio/FreshStudioHeader";
import FreshStudioFooter from "./templates/freshStudio/FreshStudioFooter";
import WarmOrganicHeader from "./templates/warmOrganic/WarmOrganicHeader";
import WarmOrganicFooter from "./templates/warmOrganic/WarmOrganicFooter";
import EmeraldStudioHeader from "./templates/emeraldStudio/EmeraldStudioHeader";
import EmeraldStudioFooter from "./templates/emeraldStudio/EmeraldStudioFooter";
import ScrollToTop from "../../components/ScrollToTop";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../utils/axios";
// import { normalizeVertical } from "./utils/vertical";
// import { Toaster } from "react-hot-toast";
import {
  getSectionPath,
  getTemplateBreadcrumbItems,
  getTemplateRouteContext,
  normalizeTemplateData,
  normalizeSlug,
  resolveSectionFromSlug,
} from "./utils/templateRouteUtils";
import { mapTestimonialItem } from "./utils/pageTemplateUtils";

const TemplateSite = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const { slug, itemSlug } = useParams();

  function getTenantFromHost() {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    return parts[0] === "www" ? null : parts[0];
  }

  const tenant = getTenantFromHost();

  const { data, isPending, error } = useQuery({
    queryKey: ["company", tenant],
    queryFn: async () => {
      const res = await api.get(`/editor/get-website/${tenant}`);
      const d = res.data;
      // If the local backend returned empty data (no companyName, no heroImages),
      // fall back directly to the master backend which has the correct data.
      if (!d?.companyName && !d?.heroImages?.length) {
        const masterPanelBaseUrl =
          import.meta.env.VITE_MASTER_PANEL_BE_URL || "http://localhost:5007";
        const fallback = await fetch(
          `${masterPanelBaseUrl}/api/editor/get-website/${encodeURIComponent(tenant)}`,
        );
        if (fallback.ok) {
          const raw = await fallback.json();
          const template = raw?.template || raw;
          // Prefer the frozen publish-time snapshot; the top-level fields
          // change with every builder draft auto-save.
          return template?.publishedData || template;
        }
      }
      return d;
    },
    enabled: !!tenant,
  });

  const normalizedData = data ? normalizeTemplateData(data) : data;
  const navigation = useNavigation();
  const isPageChanging = navigation.state === "loading";
  const isLoading = isPending || isPageChanging;
  const routeContext = getTemplateRouteContext(location.pathname);

  // Get item name for breadcrumb if we're on an item detail page
  let itemName = "";
  if (slug && itemSlug && normalizedData) {
    const productPages = Array.isArray(normalizedData?.productPages)
      ? normalizedData.productPages
      : [];
    const productDropdownPages = Array.isArray(
      normalizedData?.productDropdownPages,
    )
      ? normalizedData.productDropdownPages
      : [];
    const allPages = [...productPages, ...productDropdownPages];

    const page = allPages.find(
      (item) =>
        normalizeSlug(item?.slug || item?.name || "") === normalizeSlug(slug),
    );

    if (page) {
      // Get catalog items for this page
      const catalog = Array.isArray(page?.catalog)
        ? page.catalog
        : Array.isArray(page?.menuItems)
          ? page.menuItems
          : Array.isArray(normalizedData?.products)
            ? normalizedData.products
            : Array.isArray(normalizedData?.menuItems)
              ? normalizedData.menuItems
              : [];

      const item = catalog.find(
        (catalogItem) =>
          normalizeSlug(catalogItem?.name || catalogItem?.title || "") ===
          normalizeSlug(itemSlug),
      );

      if (item) {
        itemName = item?.name || item?.title || "";
      }
    }
  }

  const jobTitleFromState = location.state?.jobTitle || "";

  const breadcrumbItems = useMemo(
    () =>
      getTemplateBreadcrumbItems({
        data: normalizedData,
        pathname: location.pathname,
        routeContext,
        itemName: routeContext.currentCareerJobCode
          ? jobTitleFromState || routeContext.currentCareerJobCode
          : itemName,
      }).map((item) => ({
        label: item.label,
        onClick: item.path ? () => navigate(item.path) : undefined,
      })),
    [
      location.pathname,
      navigate,
      normalizedData,
      routeContext,
      itemName,
      jobTitleFromState,
    ],
  );
  const themeVariant = normalizedData?.themeVariant || "default";
  // Fresh Studio's dark/red chrome can't be expressed by TempHeader/
  // TempFooter's light/blue styling (see templates/freshStudio/), so unlike
  // every other section — which is swapped purely via
  // templates/templateRegistry.js inside the routed Outlet — the site-level
  // header/footer/breadcrumb bar are swapped here instead. This is the one
  // place this port had to touch TemplateSite.jsx; its data-fetching above
  // is untouched, and Classic's own header/footer keep rendering exactly as
  // before for every non-fresh-studio site.
  const isFreshStudio = themeVariant === "fresh-studio";
  // Same reasoning applies to Warm Organic: HostPanel's WarmOrganicTemplate.tsx
  // has its own sticky white header (serif logo wordmark, rust active
  // underline) and white footer with a warm CREAM/BROWN/RUST palette —
  // distinct from both Classic's TempHeader/TempFooter and Fresh Studio's
  // dark chrome — so it gets the same site-level swap here.
  const isWarmOrganic = themeVariant === "warm-organic";
  // Same reasoning again for Emerald Studio: HostPanel's
  // EmeraldStudioTemplate.tsx has its own fixed dark-emerald header
  // (bg-[#002c22]/[0.92] backdrop-blur, amber active underline) and dark
  // footer with amber accents — distinct from Classic, Fresh Studio's dark/
  // red chrome, and Warm Organic's light cream/rust chrome — so it gets the
  // same site-level swap here, completing all 4 HostPanel templates in
  // Nomads.
  const isEmeraldStudio = themeVariant === "emerald-studio";
  const productsPageEnabled = (normalizedData?.pageNavItems || []).some(
    (item) => resolveSectionFromSlug(item.slug) === "products",
  );

  const companyId = normalizedData?.companyId || "";
  const workspaceId = normalizedData?.workspaceId || "";
  const searchKey = normalizedData?.searchKey || "";

  const { data: reviewResponse } = useQuery({
    queryKey: ["public-reviews", companyId, workspaceId, searchKey],
    queryFn: async () => {
      const res = await api.get("/review/approved", {
        params: {
          companyId,
          source: "website",
        },
      });
      return res.data;
    },
    enabled: !!companyId,
  });

  const approvedReviews = Array.isArray(reviewResponse?.data)
    ? reviewResponse.data.map(mapTestimonialItem).filter(Boolean)
    : [];

  // Redirect to home if the current page section is disabled in pageNavItems
  // testimonials and home are always accessible (no dedicated page to disable)
  // Only run guard after data is loaded to prevent redirect during initial load
  const pageNavItems = normalizedData?.pageNavItems || [];
  const guardedSections = [
    "about",
    "products",
    "gallery",
    "partner",
    "careers",
    "contact",
  ];
  const isCurrentSectionEnabled = guardedSections.includes(
    routeContext.currentSection,
  )
    ? pageNavItems.some(
        (item) =>
          resolveSectionFromSlug(item.slug) === routeContext.currentSection,
      )
    : true;

  useEffect(() => {
    if (!isPending && !isCurrentSectionEnabled) {
      navigate(getSectionPath("home", location.pathname), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, isCurrentSectionEnabled]);

  return (
    <div className="h-screen relative overflow-y-auto overflow-hidden flex flex-col custom-scrollbar-hide">
      <ScrollToTop />
      {/* Page loader overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-primary-blue rounded-full" />
        </div>
      )}
      {isFreshStudio ? (
        <FreshStudioHeader
          ref={headerRef}
          logo={normalizedData?.companyLogoUrl}
          companyName={normalizedData?.companyName}
          pageNavItems={normalizedData?.pageNavItems}
          navItems={normalizedData?.navItems}
          productDropdownPages={normalizedData?.productDropdownPages}
          productPages={normalizedData?.productPages}
        />
      ) : isWarmOrganic ? (
        <WarmOrganicHeader
          ref={headerRef}
          logo={normalizedData?.companyLogoUrl}
          companyName={normalizedData?.companyName}
          pageNavItems={normalizedData?.pageNavItems}
          navItems={normalizedData?.navItems}
          productDropdownPages={normalizedData?.productDropdownPages}
          productPages={normalizedData?.productPages}
        />
      ) : isEmeraldStudio ? (
        <EmeraldStudioHeader
          ref={headerRef}
          logo={normalizedData?.companyLogoUrl}
          companyName={normalizedData?.companyName}
          pageNavItems={normalizedData?.pageNavItems}
          navItems={normalizedData?.navItems}
          productDropdownPages={normalizedData?.productDropdownPages}
          productPages={normalizedData?.productPages}
        />
      ) : (
        <TempHeader
          ref={headerRef}
          logo={normalizedData?.companyLogoUrl}
          pageNavItems={normalizedData?.pageNavItems}
          navItems={normalizedData?.navItems}
          productDropdownPages={normalizedData?.productDropdownPages}
          productPages={normalizedData?.productPages}
          pathname={location.pathname}
        />
      )}
      {breadcrumbItems.length > 1 ? (
        <TemplateBreadcrumbs
          items={breadcrumbItems}
          dark={isFreshStudio || isEmeraldStudio || (!isWarmOrganic && routeContext?.currentSection === "about")}
          className={
            isFreshStudio
              ? "bg-[#0A0A12]"
              : isWarmOrganic
                ? "bg-[#F1E6D3]"
                : isEmeraldStudio
                  ? "bg-[#002c22]"
                  : routeContext?.currentSection === "about"
                    ? "bg-black"
                    : "bg-[#efefef]"
          }
        />
      ) : null}
      <main className="flex-1">
        <Outlet
          context={{
            data: normalizedData,
            rawProductDropdownPages: Array.isArray(data?.productDropdownPages)
              ? data.productDropdownPages
              : [],
            isPending,
            error,
            routeContext,
            approvedReviews,
          }}
        />
        {/* <Toaster /> */}
      </main>
      <footer>
        {isFreshStudio ? (
          <FreshStudioFooter
            address={normalizedData?.address}
            contact={normalizedData?.contactTitle}
            email={normalizedData?.websiteEmail}
            phone={normalizedData?.phone}
            registeredCompany={normalizedData?.registeredCompanyName}
            logo={normalizedData?.companyLogoUrl}
            isPending={isPending}
            pageNavItems={normalizedData?.pageNavItems}
            productDropdownPages={normalizedData?.productDropdownPages}
            pathname={location.pathname}
            socials={normalizedData?.socials}
            productsPageEnabled={productsPageEnabled}
          />
        ) : isWarmOrganic ? (
          <WarmOrganicFooter
            address={normalizedData?.address}
            contact={normalizedData?.contactTitle}
            email={normalizedData?.websiteEmail}
            phone={normalizedData?.phone}
            registeredCompany={normalizedData?.registeredCompanyName}
            logo={normalizedData?.companyLogoUrl}
            isPending={isPending}
            pageNavItems={normalizedData?.pageNavItems}
            productDropdownPages={normalizedData?.productDropdownPages}
            pathname={location.pathname}
            socials={normalizedData?.socials}
            productsPageEnabled={productsPageEnabled}
          />
        ) : isEmeraldStudio ? (
          <EmeraldStudioFooter
            address={normalizedData?.address}
            contact={normalizedData?.contactTitle}
            email={normalizedData?.websiteEmail}
            phone={normalizedData?.phone}
            registeredCompany={normalizedData?.registeredCompanyName}
            companyName={normalizedData?.companyName}
            logo={normalizedData?.companyLogoUrl}
            isPending={isPending}
            pageNavItems={normalizedData?.pageNavItems}
            productDropdownPages={normalizedData?.productDropdownPages}
            pathname={location.pathname}
            socials={normalizedData?.socials}
            productsPageEnabled={productsPageEnabled}
          />
        ) : (
          <TempFooter
            address={normalizedData?.address}
            contact={normalizedData?.contactTitle}
            email={normalizedData?.websiteEmail}
            phone={normalizedData?.phone}
            registeredCompany={normalizedData?.registeredCompanyName}
            logo={normalizedData?.companyLogoUrl}
            isPending={isPending}
            pageNavItems={normalizedData?.pageNavItems}
            productDropdownPages={normalizedData?.productDropdownPages}
            pathname={location.pathname}
            socials={normalizedData?.socials}
          />
        )}
      </footer>
    </div>
  );
};

export default TemplateSite;
