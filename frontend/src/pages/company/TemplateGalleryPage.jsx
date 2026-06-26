import React from "react";
import { useOutletContext } from "react-router-dom";
import Container from "../../components/Container";
import GallerySection from "./components/GallerySection";
import LinedHeading from "./components/LinedHeading";

const TemplateGalleryPage = () => {
  const { data, isPending, error } = useOutletContext();
  if (isPending) return null;
  if (error) return <div>Error loading gallery page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const galleryImages = Array.isArray(data?.gallery) ? data.gallery : [];

  return (
    <section className="min-h-[60vh] bg-[#efefef] py-0">
      <Container>
        <div className="flex flex-col gap-6">
          <LinedHeading title={data?.galleryPageHeading || "Gallery"} />
          <GallerySection gallery={galleryImages} mode="full" />
        </div>
      </Container>
    </section>
  );
};

export default TemplateGalleryPage;
