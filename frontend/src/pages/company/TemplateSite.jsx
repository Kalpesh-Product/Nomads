import React, { useMemo, useRef } from "react";
import { Outlet, useLocation, useNavigate, useNavigation } from "react-router-dom";
import TempHeader from "./components/TempHeader";
import TempFooter from "./components/TempFooter";
import TemplateBreadcrumbs from "./components/TemplateBreadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../utils/axios";
// import { normalizeVertical } from "./utils/vertical";
// import { Toaster } from "react-hot-toast";
import {
  getTemplateBreadcrumbItems,
  getTemplateRouteContext,
  normalizeTemplateData,
} from "./utils/templateRouteUtils";
import { mapTestimonialItem } from "./utils/pageTemplateUtils";

const TemplateSite = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);

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
  const breadcrumbItems = useMemo(
    () =>
      getTemplateBreadcrumbItems({
        data: normalizedData,
        pathname: location.pathname,
        routeContext,
      }).map((item) => ({
        label: item.label,
        onClick: item.path ? () => navigate(item.path) : undefined,
      })),
    [location.pathname, navigate, normalizedData, routeContext],
  );
  const companyId = normalizedData?.companyId || "";
  const workspaceId = normalizedData?.workspaceId || "";
  const searchKey = normalizedData?.searchKey || "";

  const { data: reviewResponse } = useQuery({
    queryKey: ["public-reviews", companyId, workspaceId, searchKey],
    queryFn: async () => {
      const res = await api.get("/review", {
        params: {
          companyId,
        },
      });
      return res.data;
    },
    enabled: !!companyId,
  });

  const approvedReviews = Array.isArray(reviewResponse?.data)
    ? reviewResponse.data
        .filter((item) => {
          const status = String(item?.status || "").toLowerCase();
          return status === "approved" || !status;
        })
        .map(mapTestimonialItem)
        .filter(Boolean)
    : [];

  return (
    <div className="h-screen relative overflow-y-auto overflow-hidden flex flex-col custom-scrollbar-hide">
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
        <TemplateBreadcrumbs items={breadcrumbItems} className="bg-[#e9e9e9]" />
      ) : null}
      <main className="flex-1">
        <Outlet
          context={{
            data: normalizedData,
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
