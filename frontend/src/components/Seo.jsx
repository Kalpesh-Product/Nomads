import { Helmet } from "@dr.pogodin/react-helmet";
import { useLocation } from "react-router-dom";

import { getSeoDetailsByPath } from "../constants/seoDetails";

const Seo = ({ path, fallbackPath, image }) => {
  const location = useLocation();
  const lookupPath = path || `${location.pathname}${location.search}`;
  const seo = getSeoDetailsByPath(lookupPath, fallbackPath);

  if (!seo) return null;

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      {image ? <meta property="og:image" content={image} /> : null}
      <meta property="og:type" content="website" />
      <link rel="canonical" href={seo.link} />
    </Helmet>
  );
};

export default Seo;
