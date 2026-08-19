import React from "react";
import { useOutletContext } from "react-router-dom";
import { resolveSectionComponent } from "./templates/templateRegistry";

// Thin route wrapper — kept at this path/name because routes.jsx imports it
// directly. Picks the visual template based on themeVariant; the actual
// rendering lives in templates/templateRegistry.js (see ClassicTemplateHome
// for the current/default implementation).
const TemplateHome = () => {
  const context = useOutletContext();
  const Component = resolveSectionComponent("home", context?.data?.themeVariant);
  return <Component />;
};

export default TemplateHome;
