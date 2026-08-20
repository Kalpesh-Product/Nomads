import React from "react";
import { useOutletContext } from "react-router-dom";
import { resolveSectionComponent } from "./templates/templateRegistry";

const TemplateProductsPage = () => {
  const context = useOutletContext();
  const Component = resolveSectionComponent("products", context?.data?.themeVariant);
  return <Component />;
};

export default TemplateProductsPage;
