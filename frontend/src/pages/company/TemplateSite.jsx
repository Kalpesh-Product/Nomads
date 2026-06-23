import React, { useMemo, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
      return res.data;
    },

    enabled: !!tenant,
  });

  const normalizedData = data ? normalizeTemplateData(data) : data;
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
        <TemplateBreadcrumbs items={breadcrumbItems} className="bg-[#efefef]" />
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
