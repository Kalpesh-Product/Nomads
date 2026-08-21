import React from "react";
import { useOutletContext } from "react-router-dom";
import { resolveSectionComponent } from "./templates/templateRegistry";

const TemplateProductDetailPage = () => {
  const context = useOutletContext();
  const Component = resolveSectionComponent("productDetail", context?.data?.themeVariant);
  return <Component />;
};

export default TemplateProductDetailPage;
