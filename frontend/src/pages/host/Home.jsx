import React from "react";
import Container from "../../components/Container";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RotatingGlobe from "../../components/RotatingGlobe";

const HostHome = () => {
  // mobile screen for globe responsiveness
  const ismobile = window.innerWidth < 769;
  const isTablet = window.innerWidth < 1025;
  const isLaptop = window.innerWidth < 1441;
  return (
    <main>
      <section className="bg-[#f7feec]">
        <Container>
          <div className="flex justify-center items-center ">
            <div className="mb-0 lg:mb-20 w-full">
              <h1 className="font-semibold text-[clamp(1rem,6.5vw,7rem)]">
                Introducing
              </h1>{" "}
            </div>
            <div className="leading-normal w-full">
              <div className="relative">
                <h1 className="font-semibold text-[clamp(1rem,6.3vw,6rem)] text-nowrap">
                  N-Commerce
                </h1>
                <img
                  className="absolute w-full -bottom-6 left-0 h-1/2"
                  src="/blue-line.png"
                  alt="underline"
                />
              </div>
              <p className="text-[clamp(1rem,3.2vw,3rem)]">
                "<span>Wo</span>rld <span>No</span>mad <span>Co</span>mmerce"
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-start gap-3">
            <p className="text-title">A simple NO CODE SaaS Platform.</p>
            <p className="text-content">
              We support businesses in small and aspiring destinations which
              host Nomads!
            </p>
            <p className="text-content">
              SaaS Tech for Nomad supoorting businesses across the world.
              <span className="font-medium">
                (Example: Co-Working, Co-Living, Hostels, Workations, Resorts,
                Cafes, Events etc)
              </span>
            </p>
          </div>
          <div className="flex justify-center items-center w-full h-full my-16">
            <div className="relative w-full text-center hover:font-semibold transition-all cursor-pointer">
                <p className="uppercase ">It's Completely free</p>
                <img src="/blue-circle.png" alt="blue circle" className="absolute -top-8 left-[41%] right-6 w-56 h-30" />
            </div>
          </div>
        </Container>
      </section>
      {/* GLOBE SECTIon */}
      <section className="bg-black">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 h-[70vh] font-hero">
              <div className="min-w-full h-full" style={{ textAlign: "left" }}>
                <Canvas
                  className="canvas"
                  camera={{
                    position: [0, 0, ismobile ? 15 : 25],
                    fov: ismobile ? 40 : isTablet ? 50 : isLaptop ? 40 : 28,
                  }}
                >
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <RotatingGlobe />
                  <OrbitControls
                    enableZoom={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={(2 * Math.PI) / 3}
                  />
                </Canvas>
              </div>
              <div className=" flex flex-col justify-center items-center w-full">
                <h3 className="text-white text-[clamp(1rem,2.9vw,7rem)]">
                  <strong>
                    SUPPORTING THE FOUNDATION OF N-COMMERCE <br />
                  </strong>
                </h3>
                <p className="text-primary-blue text-[clamp(1rem,6.4vw,7rem)]"> “NOMAD COMMERCE” </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <button
                    className="hero-button"
                    data-aos-delay="200"
                    onClick={() => {
                      navigate("/register");
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                  >
                    CONNECT
                  </button>
                </div>
              </div>
            </div>
        </Container>
      </section>
      {/* GLOBE SECTIon */}
      <section>key modules</section>
      <section>one partner platform</section>
      <section>no code self </section>
      <section>testimonial</section>
    </main>
  );
};

export default HostHome;
