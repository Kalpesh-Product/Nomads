import React from "react";
import { useOutletContext } from "react-router-dom";
import { resolveSectionComponent } from "./templates/templateRegistry";

const TemplateContactPage = () => {
  const context = useOutletContext();
  const Component = resolveSectionComponent("contact", context?.data?.themeVariant);
  return <Component />;
};

export default TemplateContactPage;
