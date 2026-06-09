import React from "react";
import { useOutletContext } from "react-router-dom";
import Container from "../../components/Container";
import GallerySection from "./components/GallerySection";

const TemplateGalleryPage = () => {
  const { data, isPending, error } = useOutletContext();
  if (isPending) return null;
  if (error) return <div>Error loading gallery page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const galleryImages = Array.isArray(data?.gallery) ? data.gallery : [];

  return (
    <section className="min-h-[60vh] py-10">
      <Container>
        <div className="flex flex-col gap-6">
          <h1 className="text-center text-title font-semibold uppercase">
            {data?.galleryPageHeading || "Gallery"}
          </h1>
          <GallerySection gallery={galleryImages} mode="full" />
        </div>
      </Container>
    </section>
  );
};

export default TemplateGalleryPage;
