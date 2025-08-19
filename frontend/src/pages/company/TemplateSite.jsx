import React from "react";
import { Outlet } from "react-router-dom";
import TempHeader from "./components/TempHeader";

const TemplateSite = () => {
  return (
    <div className="h-screen relative overflow-y-auto overflow-hidden flex flex-col custom-scrollbar-hide">
      <header className="sticky top-0 z-20">
        <TempHeader />
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer>footer</footer>
    </div>
  );
};

export default TemplateSite;
