import React from "react";
import { useOutletContext } from "react-router-dom";
import { resolveSectionComponent } from "./templates/templateRegistry";

const TemplateTestimonialsPage = () => {
  const context = useOutletContext();
  const Component = resolveSectionComponent("testimonials", context?.data?.themeVariant);
  return <Component />;
};

export default TemplateTestimonialsPage;
