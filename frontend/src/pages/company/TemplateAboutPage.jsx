import React from "react";
import { useOutletContext } from "react-router-dom";
import { resolveSectionComponent } from "./templates/templateRegistry";

const TemplateAboutPage = () => {
  const context = useOutletContext();
  const Component = resolveSectionComponent("about", context?.data?.themeVariant);
  return <Component />;
};

export default TemplateAboutPage;
