import React from "react";
import { useOutletContext } from "react-router-dom";
import { resolveSectionComponent } from "./templates/templateRegistry";

const TemplateCareerPage = () => {
  const context = useOutletContext();
  const Component = resolveSectionComponent("career", context?.data?.themeVariant);
  return <Component />;
};

export default TemplateCareerPage;
