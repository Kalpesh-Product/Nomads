import React from "react";
import { useOutletContext } from "react-router-dom";
import { resolveSectionComponent } from "./templates/templateRegistry";

const TemplatePartnerPage = () => {
  const context = useOutletContext();
  const Component = resolveSectionComponent("partner", context?.data?.themeVariant);
  return <Component />;
};

export default TemplatePartnerPage;
