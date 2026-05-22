import React from "react";
import { Outlet } from "react-router-dom";
import TempHeader from "./components/TempHeader";
import TempFooter from "./components/TempFooter";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { normalizeVertical } from "./utils/vertical";
// import { Toaster } from "react-hot-toast";

const TemplateSite = () => {
  function getTenantFromHost() {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    return parts[0] === "www" ? null : parts[0];
  }

  const tenant = getTenantFromHost();

  const { data, isPending, error } = useQuery({
    queryKey: ["company", tenant],
    queryFn: async () => {
      const res = await axios.get(
        `https://wonomasterbe.vercel.app/api/editor/get-website/${tenant}`,
      );
      return res.data;
    },

    enabled: !!tenant,
  });

  const normalizedData = data
    ? {
        ...data,
        vertical: normalizeVertical(data?.vertical),
        productTitle:
          typeof data?.productTitle === "string" ? data.productTitle : "",
        products: Array.isArray(data?.products) ? data.products : [],
      }
    : data;

  return (
    <div className="h-screen relative overflow-y-auto overflow-hidden flex flex-col custom-scrollbar-hide">
      <header className="sticky top-0 z-20">
        <TempHeader
          logo={normalizedData?.companyLogo?.url}
          vertical={normalizedData?.vertical}
        />
      </header>
      <main className="flex-1">
        <Outlet context={{ data: normalizedData, isPending, error }} />
        {/* <Toaster /> */}
      </main>
      <footer>
        <TempFooter
          address={normalizedData?.address}
          contact={normalizedData?.contact}
          email={normalizedData?.email}
          phone={normalizedData?.phone}
          registeredCompany={normalizedData?.registeredCompanyName}
          logo={normalizedData?.companyLogo?.url}
          isPending={isPending}
        />
      </footer>
    </div>
  );
};

export default TemplateSite;
