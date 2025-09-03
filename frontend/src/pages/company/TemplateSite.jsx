import React from "react";
import { Outlet } from "react-router-dom";
import TempHeader from "./components/TempHeader";
import TempFooter from "./components/TempFooter";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const TemplateSite = () => {

  function getTenantFromHost() {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  return parts[0] === "www" ? null : parts[0];
}

const tenant = getTenantFromHost()
   const { data, isPending, error } = useQuery({
      queryKey: ["company", tenant],
      queryFn: async () => {
        const res = await axios.get(
          `https://wonotestbe.vercel.app/api/editor/get-website/${tenant}`
        );
        return res.data;
      },

      enabled: !!tenant,
    });


  return (
    <div className="h-screen relative overflow-y-auto overflow-hidden flex flex-col custom-scrollbar-hide">
      <header className="sticky top-0 z-20">
        <TempHeader logo={data?.companyLogo?.url} />
      </header>
      <main className="flex-1">
        <Outlet context={{ data, isPending, error }}/>
      </main>
      <footer>
        <TempFooter address={data?.address} contact={data?.contact} email={data?.email} phone={data?.phone} registeredCompany={data?.registeredCompanyName} logo={data?.companyLogo?.url} isPending={isPending}/>
      </footer>
    </div>
  );
};

export default TemplateSite;
