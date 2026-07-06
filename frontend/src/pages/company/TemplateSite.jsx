import React, { useMemo, useRef } from "react";
import { Outlet, useLocation, useNavigate, useNavigation, useParams } from "react-router-dom";
import TempHeader from "./components/TempHeader";
import TempFooter from "./components/TempFooter";
import TemplateBreadcrumbs from "./components/TemplateBreadcrumbs";
import ScrollToTop from "../../components/ScrollToTop";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../utils/axios";
// import { normalizeVertical } from "./utils/vertical";
// import { Toaster } from "react-hot-toast";
import {
  getTemplateBreadcrumbItems,
  getTemplateRouteContext,
  normalizeTemplateData,
  normalizeSlug,
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
        const fallback = await fetch(
          `https://wonomasterbe.vercel.app/api/editor/get-website/${encodeURIComponent(tenant)}`
        );
        if (fallback.ok) {
          return fallback.json();
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
    const productPages = Array.isArray(normalizedData?.productPages) ? normalizedData.productPages : [];
    const productDropdownPages = Array.isArray(normalizedData?.productDropdownPages) ? normalizedData.productDropdownPages : [];
    const allPages = [...productPages, ...productDropdownPages];
    
    const page = allPages.find((item) => 
      normalizeSlug(item?.slug || item?.name || "") === normalizeSlug(slug)
    );
    
    if (page) {
      // Get catalog items for this page
      const catalog = Array.isArray(page?.catalog) ? page.catalog : 
                     Array.isArray(page?.menuItems) ? page.menuItems :
                     Array.isArray(normalizedData?.products) ? normalizedData.products :
                     Array.isArray(normalizedData?.menuItems) ? normalizedData.menuItems : [];
      
      const item = catalog.find((catalogItem) => 
        normalizeSlug(catalogItem?.name || catalogItem?.title || "") === normalizeSlug(itemSlug)
      );
      
      if (item) {
        itemName = item?.name || item?.title || "";
      }
    }
  }
  
  const breadcrumbItems = useMemo(
    () =>
      getTemplateBreadcrumbItems({
        data: normalizedData,
        pathname: location.pathname,
        routeContext,
        itemName,
      }).map((item) => ({
        label: item.label,
        onClick: item.path ? () => navigate(item.path) : undefined,
      })),
    [location.pathname, navigate, normalizedData, routeContext, itemName],
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

  return (
    <div className="h-screen relative overflow-y-auto overflow-hidden flex flex-col custom-scrollbar-hide">
      <ScrollToTop />
      {/* Page loader overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-primary-blue rounded-full" />
        </div>
      )}
      <TempHeader
        ref={headerRef}
        logo={normalizedData?.companyLogoUrl}
        pageNavItems={normalizedData?.pageNavItems}
        navItems={normalizedData?.navItems}
        productDropdownPages={normalizedData?.productDropdownPages}
        productPages={normalizedData?.productPages}
        pathname={location.pathname}
      />
      {breadcrumbItems.length > 1 ? (
        <TemplateBreadcrumbs
          items={breadcrumbItems}
          dark={routeContext?.currentSection === "about"}
          className={
            routeContext?.currentSection === "about"
              ? "bg-black"
              : "bg-[#efefef]"
          }
        />
      ) : null}
      <main className="flex-1">
        <Outlet
          context={{
            data: normalizedData,
            rawProductDropdownPages: Array.isArray(data?.productDropdownPages) ? data.productDropdownPages : [],
            isPending,
            error,
            routeContext,
            approvedReviews,
          }}
        />
        {/* <Toaster /> */}
      </main>
      <footer>
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
        />
      </footer>
    </div>
  );
};

export default TemplateSite;
